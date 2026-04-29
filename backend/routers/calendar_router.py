from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
import models
from database import get_db
from middlewares.auth_middleware import get_current_user

router = APIRouter(prefix="/calendar", tags=["Calendar"])

@router.get("/activity")
def get_calendar_activity(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # ── Fetch topic completions for this user/month ──
    topic_rows = db.query(models.UserTopicProgress).filter(
        models.UserTopicProgress.user_id == current_user.id,
        extract("year",  models.UserTopicProgress.completed_at) == year,
        extract("month", models.UserTopicProgress.completed_at) == month,
    ).all()

    # ── Fetch quiz attempts for this user/month ──
    quiz_rows = db.query(models.UserQuizAttempt).filter(
        models.UserQuizAttempt.user_id == current_user.id,
        extract("year",  models.UserQuizAttempt.attempted_at) == year,
        extract("month", models.UserQuizAttempt.attempted_at) == month,
    ).all()

    # ── Build result dictionary keyed by day number ──
    result = {}

    # Process topic completions
    for row in topic_rows:
        day = row.completed_at.day
        if day not in result:
            result[day] = {
                "lessonsWatched": 0,
                "totalMinutes": 0,
                "quizCompleted": False,
                "quizScore": None,
                "topics": [],
                "phaseCompleted": None,
                "achievement": None,
            }
        result[day]["lessonsWatched"] += 1
        result[day]["totalMinutes"] += 15  # estimate 15 min per topic
        if row.topic and row.topic.title:
            result[day]["topics"].append(row.topic.title)

    # Process quiz attempts
    for row in quiz_rows:
        day = row.attempted_at.day
        if day not in result:
            result[day] = {
                "lessonsWatched": 0,
                "totalMinutes": 0,
                "quizCompleted": False,
                "quizScore": None,
                "topics": [],
                "phaseCompleted": None,
                "achievement": None,
            }
        result[day]["quizCompleted"] = True
        result[day]["quizScore"] = {
            "correct": row.score,
            "total": row.total,
        }
        # Give achievement if perfect score
        if row.score == row.total:
            result[day]["achievement"] = "Perfect Score 🏆"

    return result