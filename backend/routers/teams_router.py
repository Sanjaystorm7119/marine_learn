"""
teams_router.py
───────────────
Microsoft Graph email invitations for meeting scheduling.
Credentials are loaded from environment variables (no UI config needed).

Routes:
  POST   /teams/meetings        — save meeting record + send email invites
  GET    /teams/meetings        — list meetings (filter: upcoming|past|all)
  DELETE /teams/meetings/{id}   — cancel a meeting
"""

import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from middlewares.auth_middleware import get_current_user
from services import teams_service


def require_admin_or_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if current_user.role not in ("admin", "super_user"):
        raise HTTPException(status_code=403, detail="Access denied.")
    return current_user

router = APIRouter(prefix="/teams", tags=["Teams"])


def _load_creds():
    tenant_id = os.getenv("MS_TENANT_ID", "")
    client_id = os.getenv("MS_CLIENT_ID", "")
    client_secret = os.getenv("MS_CLIENT_SECRET", "")
    organizer_id = os.getenv("MS_ORGANIZER_UPN", "")
    organizer_name = os.getenv("MS_ORGANIZER_NAME", "")
    if not all([tenant_id, client_id, client_secret, organizer_id]):
        raise HTTPException(
            status_code=503,
            detail="Microsoft 365 credentials not configured in server environment.",
        )
    return tenant_id, client_id, client_secret, organizer_id, organizer_name


def _meeting_to_response(m: models.TeamsMeeting) -> schemas.TeamsMeetingResponse:
    return schemas.TeamsMeetingResponse(
        id=m.id,
        title=m.title,
        description=m.description,
        start_time=m.start_time.isoformat(),
        end_time=m.end_time.isoformat(),
        join_url=m.join_url,
        organizer_user_id=m.organizer_user_id,
        status=m.status,
        participants=m.participants or [],
        email_status=m.email_status,
        created_at=m.created_at.isoformat(),
    )


@router.post("/meetings", response_model=schemas.TeamsMeetingResponse)
def create_meeting(
    payload: schemas.TeamsMeetingCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin_or_superuser),
):
    tenant_id, client_id, client_secret, organizer_id, organizer_name = _load_creds()

    # Teams online meeting creation — uncomment when OnlineMeetings.ReadWrite.All is granted:
    # try:
    #     graph_meeting = teams_service.create_online_meeting(
    #         tenant_id=tenant_id, client_id=client_id, client_secret=client_secret,
    #         organizer_user_id=organizer_id, subject=payload.title,
    #         start_iso=payload.start_time.isoformat(), end_iso=payload.end_time.isoformat(),
    #     )
    #     join_url = graph_meeting.get("joinWebUrl") or graph_meeting.get("joinUrl")
    #     graph_id = graph_meeting.get("id")
    # except (ValueError, PermissionError, RuntimeError):
    #     join_url = graph_id = None
    join_url = None
    graph_id = None

    meeting = models.TeamsMeeting(
        title=payload.title,
        description=payload.description,
        start_time=payload.start_time,
        end_time=payload.end_time,
        join_url=join_url,
        graph_meeting_id=graph_id,
        organizer_user_id=organizer_id,
        created_by_user_id=admin.id,
        status="email_only",
        participants=[str(e) for e in payload.participants],
        email_status="pending",
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    email_status = "sent"
    try:
        start_fmt = payload.start_time.strftime("%B %d, %Y at %I:%M %p UTC")
        end_fmt = payload.end_time.strftime("%I:%M %p UTC")
        html_body = f"""
        <html><body style="font-family:Arial,sans-serif;color:#1a1a2e;">
          <h2 style="color:#0f3460;">&#128197; You're invited to a meeting</h2>
          <p><strong>{payload.title}</strong></p>
          {"<p>" + (payload.description or "") + "</p>" if payload.description else ""}
          <p>&#128336; <strong>{start_fmt}</strong> &ndash; {end_fmt}</p>
          <p>Organizer: {organizer_name}</p>
          <p style="color:#888;font-size:13px;margin-top:16px;">
            The meeting link will be shared separately.
          </p>
        </body></html>
        """
        teams_service.send_invitation_email(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret,
            organizer_user_id=organizer_id,
            organizer_display_name=organizer_name,
            subject=f"Meeting Invitation: {payload.title}",
            html_body=html_body,
            recipient_emails=[str(e) for e in payload.participants],
        )
    except Exception:
        email_status = "failed"

    meeting.email_status = email_status
    db.commit()
    db.refresh(meeting)

    return _meeting_to_response(meeting)


@router.get("/meetings", response_model=list[schemas.TeamsMeetingResponse])
def list_meetings(
    filter: str = "all",
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin_or_superuser),
):
    query = db.query(models.TeamsMeeting).filter(
        models.TeamsMeeting.status != "cancelled"
    )
    now = datetime.now(timezone.utc)
    if filter == "upcoming":
        query = query.filter(models.TeamsMeeting.start_time >= now)
    elif filter == "past":
        query = query.filter(models.TeamsMeeting.start_time < now)

    return [_meeting_to_response(m) for m in query.order_by(models.TeamsMeeting.start_time.asc()).all()]


@router.delete("/meetings/{meeting_id}")
def cancel_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin_or_superuser),
):
    meeting = db.query(models.TeamsMeeting).filter_by(id=meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    meeting.status = "cancelled"
    db.commit()
    return {"detail": "Meeting cancelled."}
