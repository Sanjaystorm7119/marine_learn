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
from datetime import datetime, timezone, timedelta

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


@router.get("/my-assigned-courses", response_model=list[schemas.AssignedCourseResponse])
def get_my_assigned_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Returns only the courses that have been assigned to the current user, with deadlines."""
    assignments = (
        db.query(models.UserCourseAssignment)
        .filter(models.UserCourseAssignment.user_id == current_user.id)
        .all()
    )
    if not assignments:
        return []

    assigned_module_ids = {a.module_id for a in assignments}
    deadline_by_module = {a.module_id: a.deadline for a in assignments}

    assigned_modules = (
        db.query(models.StudyModule)
        .filter(models.StudyModule.id.in_(assigned_module_ids))
        .all()
    )
    assigned_course_ids = {m.course_id for m in assigned_modules if m.course_id}
    if not assigned_course_ids:
        return []

    # Build a map: course_id → earliest deadline across its assigned modules
    deadline_by_course: dict[int, str | None] = {}
    for module in assigned_modules:
        if not module.course_id:
            continue
        dl = deadline_by_module.get(module.id)
        if dl is not None:
            existing = deadline_by_course.get(module.course_id)
            if existing is None or dl < existing:
                deadline_by_course[module.course_id] = dl
        elif module.course_id not in deadline_by_course:
            deadline_by_course[module.course_id] = None

    courses = (
        db.query(models.Course)
        .filter(models.Course.id.in_(assigned_course_ids))
        .order_by(models.Course.order_num)
        .all()
    )

    result = []
    for course in courses:
        dl = deadline_by_course.get(course.id)
        result.append(schemas.AssignedCourseResponse(
            id=course.id,
            title=course.title,
            description=course.description,
            order_num=course.order_num,
            modules=[schemas.StudyModuleResponse.model_validate(m) for m in course.modules],
            deadline=dl.strftime("%Y-%m-%d") if dl else None,
        ))
    return result


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


@router.get("/calendar-activity")
def get_calendar_activity(
    year: int,
    month: int,  # 1-based
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns per-day activity for the given month, month-level stats,
    and today's goal completion for the current user.
    """
    from calendar import monthrange
    tz = timezone.utc
    month_start = datetime(year, month, 1, tzinfo=tz)
    _, days_in_month = monthrange(year, month)
    month_end = datetime(year, month, days_in_month, 23, 59, 59, tzinfo=tz)
    today_utc = datetime.now(tz).date()

    # ── Topic completions this month ──────────────────────────────────────────
    topic_rows = (
        db.query(models.UserTopicProgress, models.StudyTopic, models.StudyModule)
        .join(models.StudyTopic, models.UserTopicProgress.topic_id == models.StudyTopic.id)
        .join(models.StudyModule, models.StudyTopic.module_id == models.StudyModule.id)
        .filter(
            models.UserTopicProgress.user_id == current_user.id,
            models.UserTopicProgress.completed_at >= month_start,
            models.UserTopicProgress.completed_at <= month_end,
        )
        .all()
    )

    # ── Quiz attempts this month ──────────────────────────────────────────────
    quiz_rows = (
        db.query(models.UserQuizAttempt, models.StudyModule)
        .join(models.StudyModule, models.UserQuizAttempt.module_id == models.StudyModule.id)
        .filter(
            models.UserQuizAttempt.user_id == current_user.id,
            models.UserQuizAttempt.attempted_at >= month_start,
            models.UserQuizAttempt.attempted_at <= month_end,
        )
        .all()
    )

    # ── Build per-day buckets ─────────────────────────────────────────────────
    days: dict[int, dict] = {}

    for progress, topic, module in topic_rows:
        ts = progress.completed_at
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=tz)
        d = ts.day
        bucket = days.setdefault(d, {
            "topicsCompleted": 0,
            "timeSpentMinutes": 0,
            "topicTitles": [],
            "quizzes": [],
        })
        bucket["topicsCompleted"] += 1
        bucket["timeSpentMinutes"] += progress.time_spent_seconds // 60
        bucket["topicTitles"].append(topic.title)

    for attempt, module in quiz_rows:
        ts = attempt.attempted_at
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=tz)
        d = ts.day
        bucket = days.setdefault(d, {
            "topicsCompleted": 0,
            "timeSpentMinutes": 0,
            "topicTitles": [],
            "quizzes": [],
        })
        pct = int(attempt.score / attempt.total * 100) if attempt.total else 0
        bucket["quizzes"].append({
            "moduleTitle": module.title,
            "score": attempt.score,
            "total": attempt.total,
            "pct": pct,
        })

    # ── Month stats ───────────────────────────────────────────────────────────
    active_days = len(days)

    # Streak: count consecutive days with activity going back from today.
    # Source: all UserTopicProgress + UserQuizAttempt timestamps (not limited
    # to the viewed month — a streak can span month boundaries).
    topic_dates = {
        row.completed_at.date() if row.completed_at.tzinfo
        else row.completed_at.replace(tzinfo=tz).date()
        for row in db.query(models.UserTopicProgress.completed_at)
        .filter(models.UserTopicProgress.user_id == current_user.id)
        .all()
    }
    quiz_dates = {
        row.attempted_at.date() if row.attempted_at.tzinfo
        else row.attempted_at.replace(tzinfo=tz).date()
        for row in db.query(models.UserQuizAttempt.attempted_at)
        .filter(models.UserQuizAttempt.user_id == current_user.id)
        .all()
    }
    all_active_dates = topic_dates | quiz_dates

    from datetime import timedelta
    streak = 0
    check_date = today_utc
    # If the user hasn't done anything today, start counting from yesterday
    if check_date not in all_active_dates:
        check_date -= timedelta(days=1)
    while check_date in all_active_dates:
        streak += 1
        check_date -= timedelta(days=1)

    # Modules completed all-time (all topics done)
    assigned_module_ids = {
        a.module_id for a in db.query(models.UserCourseAssignment)
        .filter(models.UserCourseAssignment.user_id == current_user.id).all()
    }
    total_modules = len(assigned_module_ids)
    modules_completed = 0
    for mid in assigned_module_ids:
        total_t = db.query(models.StudyTopic).filter(models.StudyTopic.module_id == mid).count()
        if total_t == 0:
            continue
        done_t = (
            db.query(models.UserTopicProgress)
            .join(models.StudyTopic)
            .filter(
                models.UserTopicProgress.user_id == current_user.id,
                models.StudyTopic.module_id == mid,
            )
            .count()
        )
        if done_t >= total_t:
            modules_completed += 1

    # ── Today's goals ─────────────────────────────────────────────────────────
    today_bucket = days.get(today_utc.day, {}) if (year == today_utc.year and month == today_utc.month) else {}
    today_goals = {
        "lessonWatched": today_bucket.get("topicsCompleted", 0) > 0,
        "quizCompleted": len(today_bucket.get("quizzes", [])) > 0,
        "studyMinutes": today_bucket.get("timeSpentMinutes", 0),
        "studyGoalMet": today_bucket.get("timeSpentMinutes", 0) >= 30,
    }

    return {
        "days": days,
        "monthStats": {
            "activeDays": active_days,
            "totalDays": days_in_month,
            "streak": streak,
            "modulesCompleted": modules_completed,
            "totalModules": total_modules,
        },
        "todayGoals": today_goals,
    }


@router.get("/recent-activity")
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Returns up to 15 most recent activity events for the current user."""
    events = []

    # Topic completions
    topic_rows = (
        db.query(models.UserTopicProgress, models.StudyTopic, models.StudyModule)
        .join(models.StudyTopic, models.UserTopicProgress.topic_id == models.StudyTopic.id)
        .join(models.StudyModule, models.StudyTopic.module_id == models.StudyModule.id)
        .filter(models.UserTopicProgress.user_id == current_user.id)
        .order_by(models.UserTopicProgress.completed_at.desc())
        .limit(10)
        .all()
    )
    for progress, topic, module in topic_rows:
        events.append({
            "type": "topic",
            "text": f"Completed: {topic.title}",
            "sub": module.title,
            "timestamp": progress.completed_at,
        })

    # Quiz attempts
    quiz_rows = (
        db.query(models.UserQuizAttempt, models.StudyModule)
        .join(models.StudyModule, models.UserQuizAttempt.module_id == models.StudyModule.id)
        .filter(models.UserQuizAttempt.user_id == current_user.id)
        .order_by(models.UserQuizAttempt.attempted_at.desc())
        .limit(10)
        .all()
    )
    for attempt, module in quiz_rows:
        pct = int(attempt.score / attempt.total * 100) if attempt.total else 0
        events.append({
            "type": "quiz",
            "text": f"Quiz submitted: {module.title}",
            "sub": f"Score: {pct}%",
            "timestamp": attempt.attempted_at,
        })

    # Certificates
    cert_rows = (
        db.query(models.Certificate)
        .filter(models.Certificate.user_id == current_user.id)
        .order_by(models.Certificate.issued_at.desc())
        .all()
    )
    for cert in cert_rows:
        events.append({
            "type": "certificate",
            "text": f"Certificate earned: {cert.course_title}",
            "sub": cert.certificate_number,
            "timestamp": cert.issued_at,
        })

    events.sort(key=lambda e: e["timestamp"], reverse=True)

    now = datetime.now(timezone.utc)

    def relative_time(ts):
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        diff = now - ts
        s = int(diff.total_seconds())
        if s < 60:
            return "just now"
        if s < 3600:
            m = s // 60
            return f"{m} minute{'s' if m != 1 else ''} ago"
        if s < 86400:
            h = s // 3600
            return f"{h} hour{'s' if h != 1 else ''} ago"
        d = s // 86400
        if d < 30:
            return f"{d} day{'s' if d != 1 else ''} ago"
        mo = d // 30
        return f"{mo} month{'s' if mo != 1 else ''} ago"

    return [
        {"type": e["type"], "text": e["text"], "sub": e["sub"], "time": relative_time(e["timestamp"])}
        for e in events[:15]
    ]


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
