"""
notification_router.py
──────────────────────
User-facing notification endpoints:
    GET  /notifications/            – list current user's notifications
    POST /notifications/{id}/read   – mark one as read
    POST /notifications/read-all    – mark all as read
    DELETE /notifications/{id}      – delete one

Admin-facing:
    POST /notifications/admin/send  – send notification(s) to user list
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from middlewares.auth_middleware import get_current_user
from middlewares.admin_middleware import require_admin

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ── helpers ────────────────────────────────────────────────────────────────

def _serialize(n: models.Notification) -> dict:
    return {
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat() if n.created_at else "",
        "related_course_title": n.related_course_title,
    }


# ── user routes ────────────────────────────────────────────────────────────

@router.get("/", response_model=list[schemas.NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    notifications = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == current_user.id)
        .order_by(models.Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [_serialize(n) for n in notifications]


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"ok": True}


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"ok": True}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"ok": True}


# ── admin routes ───────────────────────────────────────────────────────────

@router.post("/admin/send")
def send_notifications(
    payload: schemas.SendNotificationRequest,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Admin sends a notification to one or more users."""
    if not payload.user_ids:
        raise HTTPException(status_code=400, detail="user_ids must not be empty")

    created = 0
    for uid in payload.user_ids:
        user = db.query(models.User).filter(models.User.id == uid).first()
        if not user:
            continue
        notif = models.Notification(
            user_id=uid,
            title=payload.title,
            message=payload.message,
            type=payload.type,
            related_course_title=payload.related_course_title,
            created_at=datetime.now(timezone.utc),
        )
        db.add(notif)
        created += 1

    db.commit()
    return {"sent": created}
