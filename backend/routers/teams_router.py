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
import httpx
import models
import schemas
from database import get_db
from middlewares.auth_middleware import get_current_user
from services import teams_service
from services import recording_service

def require_admin_or_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    # We added "super user" with a space to match your database!
    if current_user.role not in ("admin", "super_user", "super user"):
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
        vessel=m.vessel,
        participants=m.participants or [],
        email_status=m.email_status,
        recording_url=m.recording_url,
        proposed_slots=m.proposed_slots,
        created_at=m.created_at.isoformat(),
    )


@router.post("/meetings", response_model=schemas.TeamsMeetingResponse)
def create_meeting(
    payload: schemas.TeamsMeetingCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin_or_superuser),
):
    tenant_id, client_id, client_secret, organizer_id, organizer_name = _load_creds()

    # 1. Fetch users assigned to this vessel
   # 1. Fetch ONLY the Master assigned to this vessel
    vessel_users = db.query(models.User).filter(
        models.User.vessel == payload.vessel,
        models.User.role == "Master"  # <-- ADDED THIS LINE
    ).all()
    
    participant_emails = [u.email for u in vessel_users if u.email]

    if not participant_emails:
        raise HTTPException(status_code=400, detail=f"No Master found for vessel: {payload.vessel}")

    # 2. Create the actual Teams Meeting via Graph API (THIS WAS MISSING!)
    # 2. Create the actual Teams Meeting via Graph API
    try:
        graph_meeting = teams_service.create_online_meeting(
            tenant_id=tenant_id, client_id=client_id, client_secret=client_secret,
            organizer_user_id=organizer_id, subject=payload.title,
            start_iso=payload.start_time.isoformat(), end_iso=payload.end_time.isoformat(),
        )
        join_url = graph_meeting.get("joinWebUrl") or graph_meeting.get("joinUrl")
        graph_id = graph_meeting.get("id")
        
        # --- NEW: Create SharePoint Folder & Upload Link ---
        drive_id = os.getenv("SHAREPOINT_DRIVE_ID")
        upload_url = ""
        if drive_id:
            upload_url = teams_service.create_sharepoint_folder_and_link(
                tenant_id, client_id, client_secret, drive_id, payload.vessel, payload.title
            )
        # ---------------------------------------------------
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Teams meeting: {str(e)}")
    
    # 3. Save to Database
    meeting = models.TeamsMeeting(
        title=payload.title,
        description=payload.description,
        start_time=payload.start_time,
        end_time=payload.end_time,
        join_url=join_url,
        graph_meeting_id=graph_id,
        organizer_user_id=organizer_id,
        created_by_user_id=admin.id,
        status="scheduled",
        vessel=payload.vessel,
        participants=participant_emails,   
        email_status="pending",
        upload_url=upload_url, # <-- ADDED THIS
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    
    # 4. Send Email with the real Join Link
    email_status = "sent"
    try:
        from datetime import timedelta
        
        # Convert UTC to IST by adding 5 hours and 30 minutes
        start_ist = payload.start_time + timedelta(hours=5, minutes=30)
        end_ist = payload.end_time + timedelta(hours=5, minutes=30)
        
        start_fmt = start_ist.strftime("%B %d, %Y at %I:%M %p IST")
        end_fmt = end_ist.strftime("%I:%M %p IST")
        
        html_body = f"""
        <html><body style="font-family:Arial,sans-serif;color:#1a1a2e;">
          <h2 style="color:#0f3460;">&#128197; You're invited to a MarineLearn Meeting</h2>
          <p><strong>{payload.title}</strong></p>
          {"<p>" + (payload.description or "") + "</p>" if payload.description else ""}
          <p>&#128336; <strong>{start_fmt}</strong> &ndash; {end_fmt}</p>
          <p>Organizer: {organizer_name}</p>
          <br/>
          <a href="{join_url}" style="background-color:#0f3460;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;margin-top:10px;">
            Click here to Join Teams Meeting
          </a>
          <br/><br/>
          <div style="background-color:#f0f4f8; padding:15px; border-radius:5px; margin-top:20px;">
              <p style="margin-top:0;"><strong>&#128194; Post-Meeting Documents:</strong></p>
              <p>After the meeting, please upload your vessel reports and documents using the secure link below:</p>
              <a href="{upload_url}" style="background-color:#10b981;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;margin-top:5px;">
                Upload Documents Here
              </a>
          </div>
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
            recipient_emails=participant_emails, # <-- Updated to use the fetched emails
        )
    except Exception:
        email_status = "failed"

    meeting.email_status = email_status
    db.commit()
    db.refresh(meeting)

    return _meeting_to_response(meeting)

@router.post("/request-availability", response_model=schemas.TeamsMeetingResponse)
def request_availability(
    payload: schemas.TeamsAvailabilityRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin_or_superuser),
):
    tenant_id, client_id, client_secret, organizer_id, organizer_name = _load_creds()

    # 1. Fetch ONLY the Master assigned to this vessel
    vessel_users = db.query(models.User).filter(
        models.User.vessel == payload.vessel,
        models.User.role == "Master"
    ).all()
    
    participant_emails = [u.email for u in vessel_users if u.email]

    if not participant_emails:
        raise HTTPException(status_code=400, detail=f"No Master found for vessel: {payload.vessel}")

    # 2. Save to Database as pending
    now = datetime.now(timezone.utc)
    meeting = models.TeamsMeeting(
        title=payload.title,
        description=payload.agenda,
        start_time=now,  # Placeholder since it's not scheduled yet
        end_time=now,    # Placeholder
        organizer_user_id=organizer_id,
        created_by_user_id=admin.id,
        status="pending_confirmation",
        vessel=payload.vessel,
        participants=participant_emails,   
        email_status="pending",
        proposed_slots={
            "dates": payload.proposed_dates,
            "times": payload.proposed_times
        }
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # 3. Send the Email
   # 3. Send the Email
    email_status = "sent"
    try:
        # 3a. Generate the HTML Table for Dates
        dates_html = """
        <table style="border-collapse: collapse; width: 100%; max-width: 400px; margin-top: 10px; margin-bottom: 20px; font-family: Arial, sans-serif; border: 2px solid black;">
          <thead>
            <tr>
              <th style="border: 2px solid black; padding: 10px; background-color: #cccccc; text-align: left;">S.NO</th>
              <th style="border: 2px solid black; padding: 10px; background-color: #cccccc; text-align: left;">Option</th>
              <th style="border: 2px solid black; padding: 10px; background-color: #cccccc; text-align: left;">Date</th>
            </tr>
          </thead>
          <tbody>
        """
        for i, d in enumerate(payload.proposed_dates, 1):
            # Convert YYYY-MM-DD to DD.MM.YYYY
            try:
                date_obj = datetime.strptime(d, "%Y-%m-%d")
                formatted_date = date_obj.strftime("%d.%m.%Y")
            except:
                formatted_date = d

            dates_html += f"""
            <tr>
              <td style="border: 2px solid black; padding: 10px; background-color: #ffffff;">{i}</td>
              <td style="border: 2px solid black; padding: 10px; background-color: #cccccc;">Option-{i}</td>
              <td style="border: 2px solid black; padding: 10px; background-color: #ffffff;">{formatted_date}</td>
            </tr>
            """
        dates_html += "</tbody></table>"

        # 3b. Generate the HTML Table for Times (Row of boxes)
        times_html = """
        <table style="border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-family: Arial, sans-serif;">
          <tr>
        """
        for t in payload.proposed_times:
            # Convert "11:00" to "11:00<br>A.M"
            try:
                time_obj = datetime.strptime(t, "%H:%M")
                formatted_time = time_obj.strftime("%I:%M<br>%p").replace("AM", "A.M").replace("PM", "P.M")
            except:
                formatted_time = t

            times_html += f"""
            <td style="border: 2px solid black; padding: 15px 10px; background-color: #cccccc; text-align: center; font-size: 14px;">
              {formatted_time}
            </td>
            """
        times_html += "</tr></table>"

        # 3c. Replace placeholders and convert newlines
        html_body = payload.email_body.replace('\n', '<br>')
        html_body = html_body.replace('{{DATES_TABLE}}', dates_html)
        html_body = html_body.replace('{{TIMES_TABLE}}', times_html)
        
        teams_service.send_invitation_email(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret,
            organizer_user_id=organizer_id,
            organizer_display_name=organizer_name,
            subject=f"Action Required: Availability for {payload.title}",
            html_body=f"<html><body style='font-family:Arial,sans-serif;color:#1a1a2e;'>{html_body}</body></html>",
            recipient_emails=participant_emails,
        )
    except Exception as e:
        print(f"Email failed: {e}")
        email_status = "failed"

    meeting.email_status = email_status
    db.commit()
    db.refresh(meeting)

    return _meeting_to_response(meeting)

@router.post("/meetings/{meeting_id}/resend-availability")
def resend_availability(
    meeting_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin_or_superuser),
):
    meeting = db.query(models.TeamsMeeting).filter_by(id=meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    
    if meeting.status != "pending_confirmation":
        raise HTTPException(status_code=400, detail="Only pending requests can be resent.")

    tenant_id, client_id, client_secret, organizer_id, organizer_name = _load_creds()

    # 1. Rebuild the HTML Tables from the database
    dates_html = """
    <table style="border-collapse: collapse; width: 100%; max-width: 400px; margin-top: 10px; margin-bottom: 20px; font-family: Arial, sans-serif; border: 2px solid black;">
      <thead>
        <tr>
          <th style="border: 2px solid black; padding: 10px; background-color: #cccccc; text-align: left;">S.NO</th>
          <th style="border: 2px solid black; padding: 10px; background-color: #cccccc; text-align: left;">Option</th>
          <th style="border: 2px solid black; padding: 10px; background-color: #cccccc; text-align: left;">Date</th>
        </tr>
      </thead>
      <tbody>
    """
    for i, d in enumerate(meeting.proposed_slots.get("dates", []), 1):
        try:
            date_obj = datetime.strptime(d, "%Y-%m-%d")
            formatted_date = date_obj.strftime("%d.%m.%Y")
        except:
            formatted_date = d
        dates_html += f"""
        <tr>
          <td style="border: 2px solid black; padding: 10px; background-color: #ffffff;">{i}</td>
          <td style="border: 2px solid black; padding: 10px; background-color: #cccccc;">Option-{i}</td>
          <td style="border: 2px solid black; padding: 10px; background-color: #ffffff;">{formatted_date}</td>
        </tr>
        """
    dates_html += "</tbody></table>"

    times_html = """
    <table style="border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-family: Arial, sans-serif;">
      <tr>
    """
    for t in meeting.proposed_slots.get("times", []):
        try:
            time_obj = datetime.strptime(t, "%H:%M")
            formatted_time = time_obj.strftime("%I:%M<br>%p").replace("AM", "A.M").replace("PM", "P.M")
        except:
            formatted_time = t
        times_html += f"""
        <td style="border: 2px solid black; padding: 15px 10px; background-color: #cccccc; text-align: center; font-size: 14px;">
          {formatted_time}
        </td>
        """
    times_html += "</tr></table>"

    # 2. Build the Reminder Email Body
    html_body = f"""
    <html><body style='font-family:Arial,sans-serif;color:#1a1a2e;'>
      <p>Dear Captain,</p>
      <p>Good day. This is a gentle reminder regarding the Microsoft Teams meeting for <strong>{meeting.vessel}</strong>.</p>
      <p>Kindly confirm your availability from one of the following proposed slots:</p>
      <p><strong>Proposed Dates:</strong><br>{dates_html}</p>
      <p><strong>Available Time Slots:</strong><br>{times_html}</p>
      <p><strong>Agenda:</strong><br>{meeting.description or '(to be discussed)'}</p>
      <p>Please reply to this email indicating your preferred date and time.</p>
      <p>Best regards,<br>MarineLearn Superuser Desk</p>
    </body></html>
    """

    # 3. Send the Email
    try:
        teams_service.send_invitation_email(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret,
            organizer_user_id=organizer_id,
            organizer_display_name=organizer_name,
            subject=f"Reminder: Action Required for {meeting.title}",
            html_body=html_body,
            recipient_emails=meeting.participants,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resend email: {str(e)}")

    return {"detail": "Reminder email sent successfully."}

@router.post("/meetings/{meeting_id}/confirm", response_model=schemas.TeamsMeetingResponse)
def confirm_meeting(
    meeting_id: int,
    payload: schemas.TeamsMeetingConfirm,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin_or_superuser),
):
    meeting = db.query(models.TeamsMeeting).filter_by(id=meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    
    tenant_id, client_id, client_secret, organizer_id, organizer_name = _load_creds()
    
    # 1. Create the actual Teams Meeting via Graph API
    try:
        graph_meeting = teams_service.create_online_meeting(
            tenant_id=tenant_id, client_id=client_id, client_secret=client_secret,
            organizer_user_id=organizer_id, subject=meeting.title,
            start_iso=payload.start_time.isoformat(), end_iso=payload.end_time.isoformat(),
        )
        join_url = graph_meeting.get("joinWebUrl") or graph_meeting.get("joinUrl")
        graph_id = graph_meeting.get("id")
        
        # Create SharePoint Folder & Upload Link
        drive_id = os.getenv("SHAREPOINT_DRIVE_ID")
        upload_url = ""
        if drive_id:
            upload_url = teams_service.create_sharepoint_folder_and_link(
                tenant_id, client_id, client_secret, drive_id, meeting.vessel, meeting.title
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Teams meeting: {str(e)}")
        
    # 2. Update Database
    meeting.start_time = payload.start_time
    meeting.end_time = payload.end_time
    meeting.join_url = join_url
    meeting.graph_meeting_id = graph_id
    meeting.status = "scheduled"
    meeting.upload_url = upload_url
    db.commit()
    
    # 3. Send Final Email with the real Join Link
    email_status = "sent"
    try:
        from datetime import timedelta
        start_ist = payload.start_time + timedelta(hours=5, minutes=30)
        end_ist = payload.end_time + timedelta(hours=5, minutes=30)
        start_fmt = start_ist.strftime("%B %d, %Y at %I:%M %p IST")
        end_fmt = end_ist.strftime("%I:%M %p IST")
        
        html_body = f"""
        <html><body style="font-family:Arial,sans-serif;color:#1a1a2e;">
          <h2 style="color:#0f3460;">&#128197; Confirmed: MarineLearn Meeting</h2>
          <p><strong>{meeting.title}</strong></p>
          {"<p>" + (meeting.description or "") + "</p>" if meeting.description else ""}
          <p>&#128336; <strong>{start_fmt}</strong> &ndash; {end_fmt}</p>
          <p>Organizer: {organizer_name}</p>
          <br/>
          <a href="{join_url}" style="background-color:#0f3460;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;margin-top:10px;">
            Click here to Join Teams Meeting
          </a>
          <br/><br/>
          <div style="background-color:#f0f4f8; padding:15px; border-radius:5px; margin-top:20px;">
              <p style="margin-top:0;"><strong>&#128194; Post-Meeting Documents:</strong></p>
              <p>After the meeting, please upload your vessel reports and documents using the secure link below:</p>
              <a href="{upload_url}" style="background-color:#10b981;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;margin-top:5px;">
                Upload Documents Here
              </a>
          </div>
        </body></html>
        """
        teams_service.send_invitation_email(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret,
            organizer_user_id=organizer_id,
            organizer_display_name=organizer_name,
            subject=f"Confirmed Meeting: {meeting.title}",
            html_body=html_body,
            recipient_emails=meeting.participants,
        )
    except Exception:
        email_status = "failed"

    meeting.email_status = email_status
    db.commit()
    db.refresh(meeting)

    return _meeting_to_response(meeting)

@router.get("/meetings", response_model=schemas.PaginatedMeetingResponse)
def list_meetings(
    page: int = 1,
    limit: int = 10,
    search: str = "",
    vessel: str = "all",
    status: str = "all",
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin_or_superuser),
):
    base_query = db.query(models.TeamsMeeting)
    now = datetime.now(timezone.utc)

    # 1. Calculate Global Dashboard Stats
    scheduled_count = base_query.filter(models.TeamsMeeting.status == "scheduled", models.TeamsMeeting.end_time >= now).count()
    completed_count = base_query.filter(models.TeamsMeeting.status == "scheduled", models.TeamsMeeting.end_time < now).count()
    cancelled_count = base_query.filter(models.TeamsMeeting.status == "cancelled").count()
    pending_count = base_query.filter(models.TeamsMeeting.status == "pending_confirmation").count()

    query = base_query

    # 2. Apply Search
    if search:
        query = query.filter(
            (models.TeamsMeeting.title.ilike(f"%{search}%")) |
            (models.TeamsMeeting.vessel.ilike(f"%{search}%"))
        )
    
    # 3. Apply Vessel Filter
    if vessel != "all":
        query = query.filter(models.TeamsMeeting.vessel == vessel)

    # 4. Apply Status Filter
    if status == "completed":
        query = query.filter(models.TeamsMeeting.status == "scheduled", models.TeamsMeeting.end_time < now)
    elif status == "scheduled":
        query = query.filter(models.TeamsMeeting.status == "scheduled", models.TeamsMeeting.end_time >= now)
    elif status != "all":
        query = query.filter(models.TeamsMeeting.status == status)

    # 5. Count total filtered records & calculate pages
    total = query.count()
    pages = (total + limit - 1) // limit if limit > 0 else 1

    # 6. Apply Pagination & Sorting (Newest first)
    offset = (page - 1) * limit
    meetings = query.order_by(models.TeamsMeeting.start_time.desc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "pages": pages,
        "scheduled_count": scheduled_count,
        "completed_count": completed_count,
        "cancelled_count": cancelled_count,
        "pending_count": pending_count,
        "items": [_meeting_to_response(m) for m in meetings]
    }


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

@router.post("/meetings/{meeting_id}/fetch-recording")
def fetch_recording(
    meeting_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin_or_superuser),
):
    meeting = db.query(models.TeamsMeeting).filter_by(id=meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    
    if not meeting.graph_meeting_id:
        raise HTTPException(status_code=400, detail="No Graph Meeting ID found for this meeting.")

    tenant_id, client_id, client_secret, organizer_id, _ = _load_creds()
    
    # <-- CHANGED THIS TO DRIVE_ID -->
    drive_id = os.getenv("SHAREPOINT_DRIVE_ID") 
    
    if not drive_id:
        raise HTTPException(status_code=500, detail="SHAREPOINT_DRIVE_ID is missing in .env file.")

    # Call the service to Download -> Upload -> Get URL
    embed_url = recording_service.fetch_and_upload_recording(
        tenant_id=tenant_id,
        client_id=client_id,
        client_secret=client_secret,
        organizer_id=organizer_id,
        graph_meeting_id=meeting.graph_meeting_id,
        drive_id=drive_id, # <-- CHANGED THIS
        meeting_title=meeting.title,
        vessel_name=meeting.vessel
    )
    
    # Save to database
    meeting.recording_url = embed_url
    db.commit()
    db.refresh(meeting)
    
    return {"detail": "Recording fetched and uploaded successfully!", "recording_url": embed_url}

@router.get("/test-containers")
def test_containers():
    tenant_id, client_id, client_secret, _, _ = _load_creds()

    token = teams_service._get_app_token(
        tenant_id,
        client_id,
        client_secret
    )

    headers = {
        "Authorization": f"Bearer {token}"
    }

    url = "https://graph.microsoft.com/beta/storage/fileStorage/containerTypes"

    resp = httpx.get(url, headers=headers)

    return {
        "status": resp.status_code,
        "response": resp.json()
    }

     