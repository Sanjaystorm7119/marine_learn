"""
study_router.py
───────────────
Routes for study materials (modules, topics, quizzes, progress).

All routes require authentication. Admin gets extra stats endpoint.

    GET  /study/modules              -> list all modules with topics + quiz
    POST /study/progress             -> mark a topic complete
    POST /study/quiz                 -> submit quiz attempt
    GET  /study/my-progress          -> current user's progress
    GET  /study/admin/stats          -> per-module completion stats (admin only)
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import get_db
from middlewares.auth_middleware import get_current_user
from middlewares.admin_middleware import require_admin

router = APIRouter(prefix="/study", tags=["Study"])


# ── Public (authenticated) endpoints ──────────────────────────────────────────

@router.get("/courses", response_model=list[schemas.CourseResponse])
def get_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Course).order_by(models.Course.order_num).all()


@router.get("/my-assigned-courses", response_model=list[schemas.CourseResponse])
def get_my_assigned_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Returns only the courses that have been assigned to the current user."""
    assigned_module_ids = {
        a.module_id
        for a in db.query(models.UserCourseAssignment)
        .filter(models.UserCourseAssignment.user_id == current_user.id)
        .all()
    }
    if not assigned_module_ids:
        return []
    assigned_course_ids = {
        m.course_id
        for m in db.query(models.StudyModule)
        .filter(models.StudyModule.id.in_(assigned_module_ids))
        .all()
        if m.course_id
    }
    if not assigned_course_ids:
        return []
    return (
        db.query(models.Course)
        .filter(models.Course.id.in_(assigned_course_ids))
        .order_by(models.Course.order_num)
        .all()
    )


@router.get("/modules", response_model=list[schemas.StudyModuleResponse])
def get_modules(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.StudyModule).order_by(models.StudyModule.order_num).all()


@router.post("/progress")
def mark_topic_complete(
    body: schemas.TopicProgressCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    topic = db.query(models.StudyTopic).filter(models.StudyTopic.id == body.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    existing = (
        db.query(models.UserTopicProgress)
        .filter_by(user_id=current_user.id, topic_id=body.topic_id)
        .first()
    )
    if not existing:
        record = models.UserTopicProgress(
            user_id=current_user.id,
            topic_id=body.topic_id,
            time_spent_seconds=body.time_spent_seconds,
            completed_at=datetime.now(timezone.utc),  # explicit — bypasses broken model default
        )
        db.add(record)
    else:
        # Accumulate time for revisits
        existing.time_spent_seconds = (existing.time_spent_seconds or 0) + body.time_spent_seconds
    db.commit()

    return {"message": "Progress saved"}


@router.post("/quiz")
def submit_quiz(
    body: schemas.QuizSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    module = db.query(models.StudyModule).filter(models.StudyModule.id == body.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    attempt = models.UserQuizAttempt(
        user_id=current_user.id,
        module_id=body.module_id,
        score=body.score,
        total=body.total,
    )
    db.add(attempt)
    db.commit()
    return {"message": "Quiz attempt saved", "score": body.score, "total": body.total}


@router.get("/my-progress", response_model=schemas.UserProgressResponse)
def get_my_progress(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    completed = (
        db.query(models.UserTopicProgress)
        .filter(models.UserTopicProgress.user_id == current_user.id)
        .all()
    )
    attempts = (
        db.query(models.UserQuizAttempt)
        .filter(models.UserQuizAttempt.user_id == current_user.id)
        .order_by(models.UserQuizAttempt.attempted_at.desc())
        .all()
    )
    return {
        "completed_topic_ids": [r.topic_id for r in completed],
        "quiz_attempts": [
            {
                "module_id": a.module_id,
                "score": a.score,
                "total": a.total,
                "attempted_at": a.attempted_at.isoformat(),
            }
            for a in attempts
        ],
    }


# ── Dashboard summary endpoint ────────────────────────────────────────────────

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns per-user dashboard stats:
      - role, enrolled_courses, completed_courses, certificates
      - total_topics_completed, hours_logged
      - in_progress_courses (assigned courses — started or not)
    """
    # Only show courses that have been assigned to this user
    assigned_module_ids = {
        a.module_id
        for a in db.query(models.UserCourseAssignment)
        .filter(models.UserCourseAssignment.user_id == current_user.id)
        .all()
    }

    if assigned_module_ids:
        assigned_course_ids = {
            m.course_id
            for m in db.query(models.StudyModule)
            .filter(models.StudyModule.id.in_(assigned_module_ids))
            .all()
            if m.course_id
        }
        courses = (
            db.query(models.Course)
            .filter(models.Course.id.in_(assigned_course_ids))
            .order_by(models.Course.order_num)
            .all()
        )
    else:
        courses = []

    # Completed topic IDs for this user (set for O(1) lookup)
    completed_set = {
        r.topic_id
        for r in db.query(models.UserTopicProgress)
        .filter(models.UserTopicProgress.user_id == current_user.id)
        .all()
    }

    total_topics_done = len(completed_set)
    enrolled_count = len(courses)
    completed_count = 0
    in_progress = []

    for course in courses:
        topic_ids = [
            topic.id
            for module in course.modules
            for topic in module.topics
        ]
        total = len(topic_ids)
        if total == 0:
            continue

        done = sum(1 for tid in topic_ids if tid in completed_set)
        pct = round(done / total * 100, 1)

        if pct >= 100:
            completed_count += 1
        else:
            # First module that still has incomplete topics
            next_module = None
            for module in course.modules:
                mod_topic_ids = [t.id for t in module.topics]
                if mod_topic_ids and not all(tid in completed_set for tid in mod_topic_ids):
                    next_module = module.title
                    break

            in_progress.append({
                "course_id": course.id,
                "course_title": course.title,
                "progress_pct": pct,
                "completed_topics": done,
                "total_topics": total,
                "next_module_title": next_module,
            })

    total_seconds = (
        db.query(func.sum(models.UserTopicProgress.time_spent_seconds))
        .filter(models.UserTopicProgress.user_id == current_user.id)
        .scalar()
        or 0
    )
    hours_logged = round(total_seconds / 3600, 1)

    return {
        "role": current_user.role,
        "enrolled_courses": enrolled_count,
        "completed_courses": completed_count,
        "certificates": db.query(models.Certificate).filter_by(user_id=current_user.id).count(),
        "total_topics_completed": total_topics_done,
        "hours_logged": hours_logged,
        "in_progress_courses": in_progress,
    }


# ── Certificate endpoints ──────────────────────────────────────────────────────

@router.post("/certificates", response_model=schemas.CertificateResponse)
def issue_certificate(
    body: schemas.CertificateIssueRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = (
        db.query(models.Certificate)
        .filter_by(user_id=current_user.id, course_title=body.course_title)
        .first()
    )
    if existing:
        cert = existing
    else:
        cert = models.Certificate(
            user_id=current_user.id,
            course_title=body.course_title,
            certificate_number=f"MAR-{str(uuid.uuid4())[:8].upper()}",
        )
        db.add(cert)
        db.commit()
        db.refresh(cert)
    return schemas.CertificateResponse(
        id=cert.id,
        user_full_name=current_user.full_name,
        course_title=cert.course_title,
        issued_at=cert.issued_at.isoformat(),
        certificate_number=cert.certificate_number,
    )


@router.get("/certificates", response_model=list[schemas.CertificateResponse])
def get_certificates(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    certs = (
        db.query(models.Certificate)
        .filter_by(user_id=current_user.id)
        .order_by(models.Certificate.issued_at.desc())
        .all()
    )
    return [
        schemas.CertificateResponse(
            id=c.id,
            user_full_name=current_user.full_name,
            course_title=c.course_title,
            issued_at=c.issued_at.isoformat(),
            certificate_number=c.certificate_number,
        )
        for c in certs
    ]


# ── Admin endpoint ─────────────────────────────────────────────────────────────

@router.get("/admin/stats")
def get_study_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    modules = db.query(models.StudyModule).order_by(models.StudyModule.order_num).all()
    total_users = db.query(models.User).count()

    stats = []
    for mod in modules:
        topic_ids = [t.id for t in mod.topics]
        completions = (
            db.query(models.UserTopicProgress.user_id)
            .filter(models.UserTopicProgress.topic_id.in_(topic_ids))
            .distinct()
            .count()
            if topic_ids else 0
        )
        best_quiz = (
            db.query(func.max(models.UserQuizAttempt.score))
            .filter(models.UserQuizAttempt.module_id == mod.id)
            .scalar()
        )
        stats.append({
            "module_id": mod.id,
            "module_title": mod.title,
            "users_started": completions,
            "total_users": total_users,
            "completion_pct": round((completions / total_users * 100) if total_users else 0, 1),
            "best_quiz_score": best_quiz,
        })

    return stats
