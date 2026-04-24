"""
phishing_router.py
──────────────────
Phishing awareness drill endpoints.

Routes (superuser-only unless noted):
  GET    /phishing/templates          — list templates
  POST   /phishing/templates          — create custom template
  DELETE /phishing/templates/{id}     — delete custom template (not built-in)
  POST   /phishing/campaigns          — launch drill to all users
  GET    /phishing/campaigns          — list campaigns launched by current superuser
  GET    /phishing/campaigns/{id}     — campaign detail + per-user click results
  GET    /phishing/click/{token}      — track click (PUBLIC — no auth required)
"""

import logging
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from middlewares.superuser_middleware import require_superuser
from services import phishing_service, teams_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/phishing", tags=["Phishing"])


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


def _campaign_summary(campaign: models.PhishingCampaign) -> dict:
    targets = campaign.targets or []
    sent = [t for t in targets if t.email_status == "sent"]
    clicked = [t for t in targets if t.clicked_at is not None]
    click_rate = round(len(clicked) / len(sent) * 100, 1) if sent else 0.0
    return {
        "id": campaign.id,
        "name": campaign.name,
        "template_name": campaign.template.name if campaign.template else "",
        "status": campaign.status,
        "created_at": campaign.created_at.isoformat(),
        "total_sent": len(sent),
        "total_clicked": len(clicked),
        "click_rate": click_rate,
    }


# ── Templates ─────────────────────────────────────────────────────────────────

@router.get("/templates", response_model=list[schemas.PhishingTemplateResponse])
def list_templates(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_superuser),
):
    phishing_service.seed_builtin_templates(db)
    templates = db.query(models.PhishingTemplate).order_by(
        models.PhishingTemplate.is_builtin.desc(),
        models.PhishingTemplate.created_at.asc(),
    ).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "subject": t.subject,
            "html_body": t.html_body,
            "is_builtin": t.is_builtin,
            "created_at": t.created_at.isoformat(),
        }
        for t in templates
    ]


@router.post("/templates", response_model=schemas.PhishingTemplateResponse)
def create_template(
    payload: schemas.PhishingTemplateCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_superuser),
):
    tmpl = models.PhishingTemplate(
        name=payload.name,
        subject=payload.subject,
        html_body=payload.html_body,
        created_by_user_id=current_user.id,
        is_builtin=False,
    )
    db.add(tmpl)
    db.commit()
    db.refresh(tmpl)
    logger.info("Custom phishing template created: id=%s by=%s", tmpl.id, current_user.email)
    return {
        "id": tmpl.id,
        "name": tmpl.name,
        "subject": tmpl.subject,
        "html_body": tmpl.html_body,
        "is_builtin": tmpl.is_builtin,
        "created_at": tmpl.created_at.isoformat(),
    }


@router.delete("/templates/{template_id}")
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_superuser),
):
    tmpl = db.query(models.PhishingTemplate).filter_by(id=template_id).first()
    if not tmpl:
        raise HTTPException(status_code=404, detail="Template not found")
    if tmpl.is_builtin:
        raise HTTPException(status_code=400, detail="Built-in templates cannot be deleted")
    db.delete(tmpl)
    db.commit()
    return {"ok": True}


# ── Campaigns ─────────────────────────────────────────────────────────────────

@router.get("/campaigns", response_model=list[schemas.PhishingCampaignResponse])
def list_campaigns(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_superuser),
):
    campaigns = (
        db.query(models.PhishingCampaign)
        .filter_by(created_by_user_id=current_user.id)
        .order_by(models.PhishingCampaign.created_at.desc())
        .all()
    )
    return [_campaign_summary(c) for c in campaigns]


@router.get("/campaigns/{campaign_id}", response_model=schemas.PhishingCampaignDetail)
def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_superuser),
):
    campaign = db.query(models.PhishingCampaign).filter_by(
        id=campaign_id, created_by_user_id=current_user.id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    result = _campaign_summary(campaign)
    result["targets"] = [
        {
            "user_id": t.user_id,
            "full_name": t.full_name_snapshot,
            "email": t.email_snapshot,
            "role": t.role_snapshot,
            "email_status": t.email_status,
            "sent_at": t.sent_at.isoformat() if t.sent_at else None,
            "clicked": t.clicked_at is not None,
            "clicked_at": t.clicked_at.isoformat() if t.clicked_at else None,
            "tracking_url": phishing_service.build_click_url(t.tracking_token),
        }
        for t in (campaign.targets or [])
    ]
    return result


@router.post("/campaigns", response_model=schemas.PhishingCampaignResponse)
def launch_campaign(
    payload: schemas.PhishingCampaignCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_superuser),
):
    template = db.query(models.PhishingTemplate).filter_by(id=payload.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    campaign = models.PhishingCampaign(
        name=payload.name,
        template_id=template.id,
        created_by_user_id=current_user.id,
        status="active",
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    users = db.query(models.User).all()
    tenant_id, client_id, client_secret, organizer_id, organizer_name = _load_creds()

    sent_count = 0
    for user in users:
        token = phishing_service.generate_tracking_token()
        target = models.PhishingTarget(
            campaign_id=campaign.id,
            user_id=user.id,
            email_snapshot=user.email,
            full_name_snapshot=user.full_name or user.email,
            role_snapshot=user.role,
            tracking_token=token,
        )
        db.add(target)
        db.commit()
        db.refresh(target)

        click_url = phishing_service.build_click_url(token)
        html_body = phishing_service.render_email_html(
            template.html_body,
            tracking_url=click_url,
            recipient_name=user.full_name or user.email,
        )

        try:
            teams_service.send_invitation_email(
                tenant_id=tenant_id,
                client_id=client_id,
                client_secret=client_secret,
                organizer_user_id=organizer_id,
                organizer_display_name=organizer_name,
                subject=template.subject,
                html_body=html_body,
                recipient_emails=[user.email],
            )
            target.email_status = "sent"
            target.sent_at = datetime.now(timezone.utc)
            sent_count += 1
            logger.info("Drill email sent: campaign=%s user=%s", campaign.id, user.email)
        except Exception as exc:
            target.email_status = "failed"
            logger.warning("Drill email failed for %s: %s", user.email, exc)

        db.commit()

    campaign.email_sent_count = sent_count
    db.commit()
    db.refresh(campaign)

    logger.info(
        "Phishing campaign launched: id=%s name=%r sent=%s/%s by=%s",
        campaign.id, campaign.name, sent_count, len(users), current_user.email,
    )
    return _campaign_summary(campaign)


# ── Public click tracking ──────────────────────────────────────────────────────

@router.get("/click/{token}")
def track_click(
    token: str,
    request: Request,
    db: Session = Depends(get_db),
):
    ua = request.headers.get("user-agent", "")
    ip = request.client.host if request.client else "unknown"

    target = db.query(models.PhishingTarget).filter_by(tracking_token=token).first()

    if target is None:
        return RedirectResponse(
            url=phishing_service.build_landing_url(caught=False),
            status_code=302,
        )

    is_first_real_click = (
        target.clicked_at is None and not phishing_service.is_bot_ua(ua)
    )

    # Capture campaign info before session state changes
    campaign_id = target.campaign_id
    creator_id = None
    campaign_name = "Unknown"
    campaign_row = db.query(models.PhishingCampaign).filter_by(id=campaign_id).first()
    if campaign_row:
        creator_id = campaign_row.created_by_user_id
        campaign_name = campaign_row.name

    phishing_service.record_click(db, token, ip, ua)

    if is_first_real_click and creator_id:
        dedup_key = f"phishing:{campaign_id}:{target.user_id}"
        exists = db.query(models.Notification).filter(
            models.Notification.user_id == creator_id,
            models.Notification.type == "phishing_click",
            models.Notification.related_course_title == dedup_key,
        ).first()

        if not exists:
            db.add(models.Notification(
                user_id=creator_id,
                title="Phishing drill link clicked",
                message=(
                    f"{target.full_name_snapshot} ({target.email_snapshot}) "
                    f"clicked the bait link in campaign \"{campaign_name}\"."
                ),
                type="phishing_click",
                is_read=False,
                created_at=datetime.now(timezone.utc),
                related_course_title=dedup_key,
            ))
            db.commit()

    return RedirectResponse(
        url=phishing_service.build_landing_url(caught=True),
        status_code=302,
    )
