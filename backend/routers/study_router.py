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
        record = models.UserTopicProgress(user_id=current_user.id, topic_id=body.topic_id)
        db.add(record)
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
