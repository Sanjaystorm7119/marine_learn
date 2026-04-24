import logging
import os
import secrets
from datetime import datetime, timezone

from sqlalchemy.orm import Session

import models

logger = logging.getLogger(__name__)

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")
PUBLIC_APP_URL = os.getenv("PUBLIC_APP_URL", "http://localhost:5173")

_BOT_UA_PATTERNS = [
    "barracuda", "proofpoint", "mimecast", "symantec", "microsoft link preview",
    "livelinkpreview", "appengine-google", "urlscan", "virustotal",
    "phishtank", "safebrowsing", "preview", "scanner", "crawler",
    "bot", "spider", "linkcheck",
]

_BUILTIN_TEMPLATES = [
    # ── General IT / HR ──────────────────────────────────────────────────
    {
        "name": "Fake IT Password Reset",
        "subject": "Action Required: Your MarineLearn password will expire in 24 hours",
        "html_body": """<!-- SIMULATION -->
<html><body style="font-family:Arial,sans-serif;color:#1a1a2e;max-width:600px;margin:auto;padding:0;">
<div style="background:#0f3460;padding:24px;text-align:center;">
  <h2 style="color:#fff;margin:0;">MarineLearn IT Support</h2>
</div>
<div style="padding:32px;background:#f8f9fa;">
  <p>Dear {{recipient_name}},</p>
  <p>Your MarineLearn account password will expire in <strong>24 hours</strong>. To maintain access to your training modules and certificates, please update your password now.</p>
  <p style="text-align:center;margin:32px 0;">
    <a href="{{tracking_url}}" style="background:#e94560;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Reset Password Now</a>
  </p>
  <p style="color:#888;font-size:13px;">If you did not request this, contact IT support at support@marinelearn.internal</p>
</div>
<div style="background:#dee2e6;padding:12px;text-align:center;font-size:12px;color:#6c757d;">MarineLearn IT Security Team</div>
</body></html>""",
    },
    {
        "name": "IT Security Alert",
        "subject": "Security Alert: Unauthorized login attempt detected on your account",
        "html_body": """<!-- SIMULATION -->
<html><body style="font-family:Arial,sans-serif;color:#1a1a2e;max-width:600px;margin:auto;padding:0;">
<div style="background:#c0392b;padding:24px;text-align:center;">
  <h2 style="color:#fff;margin:0;">&#9888; SECURITY ALERT</h2>
</div>
<div style="padding:32px;background:#f8f9fa;">
  <p>Dear {{recipient_name}},</p>
  <p>We detected a suspicious login attempt on your MarineLearn account from an unrecognized device. For your security, full account access has been temporarily restricted.</p>
  <p>Please verify your identity immediately to restore access:</p>
  <p style="text-align:center;margin:32px 0;">
    <a href="{{tracking_url}}" style="background:#c0392b;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Verify My Identity</a>
  </p>
  <p style="color:#888;font-size:13px;">MarineLearn Security Team | This alert was generated automatically.</p>
</div>
<div style="background:#dee2e6;padding:12px;text-align:center;font-size:12px;color:#6c757d;">MarineLearn Security Operations</div>
</body></html>""",
    },
    {
        "name": "Crew Salary Update",
        "subject": "Your payslip for this month is ready — includes a salary adjustment",
        "html_body": """<!-- SIMULATION -->
<html><body style="font-family:Arial,sans-serif;color:#1a1a2e;max-width:600px;margin:auto;padding:0;">
<div style="background:#27ae60;padding:24px;text-align:center;">
  <h2 style="color:#fff;margin:0;">HR Payroll Notification</h2>
</div>
<div style="padding:32px;background:#f8f9fa;">
  <p>Dear {{recipient_name}},</p>
  <p>Your payslip for this month is now available. Your salary has been processed and includes a <strong>performance-based adjustment</strong>. Please review the updated amount before the 5th.</p>
  <p style="text-align:center;margin:32px 0;">
    <a href="{{tracking_url}}" style="background:#27ae60;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">View My Payslip</a>
  </p>
  <p style="color:#888;font-size:13px;">HR Department | MarineLearn Group | Confidential</p>
</div>
<div style="background:#dee2e6;padding:12px;text-align:center;font-size:12px;color:#6c757d;">MarineLearn HR Department</div>
</body></html>""",
    },
    # ── Maritime / Regulatory ────────────────────────────────────────────
    {
        "name": "Port Authority Document Check",
        "subject": "Urgent: Port inspection — vessel documentation verification required",
        "html_body": """<!-- SIMULATION -->
<html><body style="font-family:Arial,sans-serif;color:#1a1a2e;max-width:600px;margin:auto;padding:0;">
<div style="background:#1a1a2e;padding:24px;text-align:center;">
  <h2 style="color:#e2c95e;margin:0;letter-spacing:1px;">PORT AUTHORITY NOTICE</h2>
  <p style="color:#aaa;margin:6px 0 0;font-size:13px;">Maritime Safety Compliance Division</p>
</div>
<div style="padding:32px;background:#f8f9fa;">
  <p>Dear {{recipient_name}},</p>
  <p>Following a routine pre-arrival check, the Port Authority requires immediate verification of your vessel documentation before the upcoming port call. <strong>Failure to verify within 2 hours</strong> may result in delayed entry and an additional inspection fee.</p>
  <table style="margin:24px auto;border:1px solid #dee2e6;border-radius:6px;border-collapse:collapse;font-size:13px;color:#555;">
    <tr><td style="padding:8px 16px;border-bottom:1px solid #dee2e6;font-weight:600;">Notice Ref</td><td style="padding:8px 16px;border-bottom:1px solid #dee2e6;">PA-2026-0427-INS</td></tr>
    <tr><td style="padding:8px 16px;font-weight:600;">Deadline</td><td style="padding:8px 16px;color:#c0392b;font-weight:600;">Within 2 hours of receipt</td></tr>
  </table>
  <p style="text-align:center;margin:28px 0;">
    <a href="{{tracking_url}}" style="background:#1a1a2e;color:#e2c95e;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;letter-spacing:0.5px;">Verify Documents Now</a>
  </p>
  <p style="color:#888;font-size:12px;">This is an official notice from the Port Authority Compliance Division. Do not ignore this communication.</p>
</div>
<div style="background:#1a1a2e;padding:12px;text-align:center;font-size:11px;color:#666;">Port Authority — Maritime Compliance Division | pa-compliance@portauth.gov.marine</div>
</body></html>""",
    },
    {
        "name": "STCW Certificate Renewal",
        "subject": "Action Required: Your STCW certificate expires in 7 days — renew now",
        "html_body": """<!-- SIMULATION -->
<html><body style="font-family:Arial,sans-serif;color:#1a1a2e;max-width:600px;margin:auto;padding:0;">
<div style="background:#0f3460;padding:24px;text-align:center;">
  <h2 style="color:#fff;margin:0;">&#127758; STCW Certification Alert</h2>
  <p style="color:#93c5fd;margin:6px 0 0;font-size:13px;">International Maritime Training Registry</p>
</div>
<div style="padding:32px;background:#f8f9fa;">
  <p>Dear {{recipient_name}},</p>
  <p>Our records indicate that your <strong>STCW Basic Safety Training</strong> certificate is due to expire in <strong>7 days</strong>. Failure to renew before the expiry date may affect your eligibility to serve on vessels under international regulations.</p>
  <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:14px 18px;margin:20px 0;">
    <strong style="color:#856404;">&#9888; Important:</strong>
    <span style="color:#856404;font-size:13px;"> Expired STCW certificates can result in immediate standoff from duty under SOLAS Chapter VI.</span>
  </div>
  <p style="text-align:center;margin:28px 0;">
    <a href="{{tracking_url}}" style="background:#0f3460;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Renew Certificate Online</a>
  </p>
  <p style="color:#888;font-size:12px;">Certificate ID: STCW-BST-{{recipient_name | upper}}-2023 | Registry: IMO Global Training Register</p>
</div>
<div style="background:#dee2e6;padding:12px;text-align:center;font-size:11px;color:#6c757d;">International Maritime Training Registry | imtr-support@maritimetraining.org</div>
</body></html>""",
    },
    {
        "name": "ISM Safety Management Audit",
        "subject": "ISM Audit Notification: Complete your annual safety declaration",
        "html_body": """<!-- SIMULATION -->
<html><body style="font-family:Arial,sans-serif;color:#1a1a2e;max-width:600px;margin:auto;padding:0;">
<div style="background:#2c3e50;padding:24px;text-align:center;">
  <h2 style="color:#ecf0f1;margin:0;">ISM Safety Management System</h2>
  <p style="color:#95a5a6;margin:6px 0 0;font-size:12px;">Annual Safety Declaration — Crew Compliance Portal</p>
</div>
<div style="padding:32px;background:#f8f9fa;">
  <p>Dear {{recipient_name}},</p>
  <p>As part of the annual ISM Code audit cycle, all crew members are required to complete their <strong>Individual Safety Declaration</strong> via the compliance portal. Your declaration is overdue and must be submitted within <strong>48 hours</strong> to avoid a flag in your crew record.</p>
  <ul style="color:#555;font-size:13px;line-height:1.8;">
    <li>Confirm awareness of Emergency Muster Procedures</li>
    <li>Acknowledge latest SMS Policy revision (Rev. 14 — March 2026)</li>
    <li>Verify personal safety equipment inspection date</li>
  </ul>
  <p style="text-align:center;margin:28px 0;">
    <a href="{{tracking_url}}" style="background:#2c3e50;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Complete Safety Declaration</a>
  </p>
  <p style="color:#888;font-size:12px;">Reference: ISM-AUDIT-2026-Q2 | Compliance Officer: safety@companyism.internal</p>
</div>
<div style="background:#2c3e50;padding:12px;text-align:center;font-size:11px;color:#7f8c8d;">ISM Compliance Office | Confidential — Do not forward</div>
</body></html>""",
    },
    {
        "name": "Fuel Supplier Invoice",
        "subject": "Overdue Invoice #INV-2026-0318 — Immediate payment confirmation required",
        "html_body": """<!-- SIMULATION -->
<html><body style="font-family:Arial,sans-serif;color:#1a1a2e;max-width:600px;margin:auto;padding:0;">
<div style="background:#e67e22;padding:24px;text-align:center;">
  <h2 style="color:#fff;margin:0;">&#128196; Invoice Payment Notice</h2>
  <p style="color:#fad7a0;margin:6px 0 0;font-size:13px;">Global Marine Fuel Suppliers Ltd.</p>
</div>
<div style="padding:32px;background:#f8f9fa;">
  <p>Dear {{recipient_name}},</p>
  <p>This is a reminder that Invoice <strong>#INV-2026-0318</strong> for bunker fuel delivery is <strong>14 days overdue</strong>. To avoid service suspension and late payment penalties, please confirm payment or update your payment details immediately.</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin:20px 0;border:1px solid #dee2e6;border-radius:6px;">
    <tr style="background:#fff3cd;"><td style="padding:9px 14px;font-weight:600;">Invoice No.</td><td style="padding:9px 14px;">INV-2026-0318</td></tr>
    <tr><td style="padding:9px 14px;font-weight:600;border-top:1px solid #dee2e6;">Amount Due</td><td style="padding:9px 14px;border-top:1px solid #dee2e6;color:#c0392b;font-weight:700;">USD 47,250.00</td></tr>
    <tr style="background:#f8f9fa;"><td style="padding:9px 14px;font-weight:600;border-top:1px solid #dee2e6;">Due Date</td><td style="padding:9px 14px;border-top:1px solid #dee2e6;color:#c0392b;">OVERDUE — 14 days</td></tr>
  </table>
  <p style="text-align:center;margin:28px 0;">
    <a href="{{tracking_url}}" style="background:#e67e22;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Confirm Payment / Update Details</a>
  </p>
  <p style="color:#888;font-size:12px;">Global Marine Fuel Suppliers Ltd. | accounts@globalmarine-fuel.com | +44 20 7946 0321</p>
</div>
<div style="background:#e67e22;padding:12px;text-align:center;font-size:11px;color:#fad7a0;">Global Marine Fuel Suppliers Ltd. — Accounts Receivable Department</div>
</body></html>""",
    },
    {
        "name": "Manning Agency Contract Update",
        "subject": "Your employment contract has been updated — review and sign by Friday",
        "html_body": """<!-- SIMULATION -->
<html><body style="font-family:Arial,sans-serif;color:#1a1a2e;max-width:600px;margin:auto;padding:0;">
<div style="background:#1a5276;padding:24px;text-align:center;">
  <h2 style="color:#fff;margin:0;">&#128203; Contract Update Notice</h2>
  <p style="color:#aed6f1;margin:6px 0 0;font-size:13px;">SeaForce Manning Agency — Crew Contracts Division</p>
</div>
<div style="padding:32px;background:#f8f9fa;">
  <p>Dear {{recipient_name}},</p>
  <p>Your employment contract has been revised with updated terms effective <strong>1 May 2026</strong>, including adjustments to leave entitlement, medical coverage, and repatriation allowances. Please review and sign the updated contract <strong>before Friday</strong>.</p>
  <div style="background:#eaf4fb;border-left:4px solid #1a5276;padding:12px 16px;margin:18px 0;font-size:13px;color:#1a5276;">
    Unsigned contracts after the deadline will be placed on hold and your next rotation may be affected.
  </div>
  <p style="text-align:center;margin:28px 0;">
    <a href="{{tracking_url}}" style="background:#1a5276;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Review &amp; Sign Contract</a>
  </p>
  <p style="color:#888;font-size:12px;">SeaForce Manning Agency | contracts@seaforcecrewing.com | Ref: SFA-CREW-2026-{{recipient_name}}</p>
</div>
<div style="background:#1a5276;padding:12px;text-align:center;font-size:11px;color:#aed6f1;">SeaForce Manning Agency — Crew Contracts Division | Confidential</div>
</body></html>""",
    },
    {
        "name": "Vessel VPN / Remote Access Reset",
        "subject": "Your shipboard VPN access will be revoked — verify credentials to retain access",
        "html_body": """<!-- SIMULATION -->
<html><body style="font-family:Arial,sans-serif;color:#1a1a2e;max-width:600px;margin:auto;padding:0;">
<div style="background:#117a65;padding:24px;text-align:center;">
  <h2 style="color:#fff;margin:0;">&#128274; Remote Access Security Notice</h2>
  <p style="color:#a2d9ce;margin:6px 0 0;font-size:12px;">Fleet IT Infrastructure — VPN Access Management</p>
</div>
<div style="padding:32px;background:#f8f9fa;">
  <p>Dear {{recipient_name}},</p>
  <p>As part of our annual security audit, all shipboard VPN credentials are being rotated. Your current access token will be <strong>revoked in 12 hours</strong>. To retain remote access to vessel systems and the MarineLearn portal, please verify your identity and generate a new access token.</p>
  <div style="background:#d5f5e3;border:1px solid #27ae60;border-radius:6px;padding:12px 16px;margin:18px 0;font-size:13px;">
    <strong>Your current token:</strong> <code style="background:#fff;padding:2px 6px;border-radius:3px;font-size:12px;">VPN-MRN-****-****-7842</code>
  </div>
  <p style="text-align:center;margin:28px 0;">
    <a href="{{tracking_url}}" style="background:#117a65;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Verify Identity &amp; Renew Token</a>
  </p>
  <p style="color:#888;font-size:12px;">Fleet IT Infrastructure | it-security@fleetops.internal | Do not share this email.</p>
</div>
<div style="background:#117a65;padding:12px;text-align:center;font-size:11px;color:#a2d9ce;">Fleet IT Infrastructure — VPN Access Management | Automated Security System</div>
</body></html>""",
    },
    {
        "name": "Company Travel Booking Confirmation",
        "subject": "Your travel itinerary is ready — confirm your details to complete booking",
        "html_body": """<!-- SIMULATION -->
<html><body style="font-family:Arial,sans-serif;color:#1a1a2e;max-width:600px;margin:auto;padding:0;">
<div style="background:#6c3483;padding:24px;text-align:center;">
  <h2 style="color:#fff;margin:0;">&#9992; Travel Booking Confirmation</h2>
  <p style="color:#d7bde2;margin:6px 0 0;font-size:13px;">MarineLearn Corporate Travel — Crew Logistics</p>
</div>
<div style="padding:32px;background:#f8f9fa;">
  <p>Dear {{recipient_name}},</p>
  <p>Your travel arrangement for the upcoming crew rotation has been prepared. Please review the itinerary details and <strong>confirm your passport and contact information</strong> by end of day to avoid cancellation.</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin:20px 0;border:1px solid #dee2e6;">
    <tr style="background:#f4ecf7;"><td style="padding:9px 14px;font-weight:600;">Booking Ref</td><td style="padding:9px 14px;">ML-TRAVEL-2026-CR047</td></tr>
    <tr><td style="padding:9px 14px;font-weight:600;border-top:1px solid #dee2e6;">Departure</td><td style="padding:9px 14px;border-top:1px solid #dee2e6;">Singapore (SIN) → Rotterdam (RTM)</td></tr>
    <tr style="background:#f4ecf7;"><td style="padding:9px 14px;font-weight:600;border-top:1px solid #dee2e6;">Date</td><td style="padding:9px 14px;border-top:1px solid #dee2e6;">3 May 2026 | 09:45 SGT</td></tr>
  </table>
  <p style="text-align:center;margin:28px 0;">
    <a href="{{tracking_url}}" style="background:#6c3483;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Confirm Travel Details</a>
  </p>
  <p style="color:#888;font-size:12px;">MarineLearn Corporate Travel | travel@marinelearn.internal | Booking expires in 24 hours.</p>
</div>
<div style="background:#6c3483;padding:12px;text-align:center;font-size:11px;color:#d7bde2;">MarineLearn Corporate Travel — Crew Logistics Division</div>
</body></html>""",
    },
]


def seed_builtin_templates(db: Session) -> None:
    existing_names = {
        row.name
        for row in db.query(models.PhishingTemplate.name).filter_by(is_builtin=True).all()
    }
    added = 0
    for t in _BUILTIN_TEMPLATES:
        if t["name"] not in existing_names:
            db.add(models.PhishingTemplate(is_builtin=True, **t))
            added += 1
    if added:
        db.commit()
        logger.info("Seeded %d new built-in phishing templates", added)


def generate_tracking_token() -> str:
    return secrets.token_urlsafe(32)


def is_bot_ua(user_agent: str) -> bool:
    ua_lower = (user_agent or "").lower()
    return any(p in ua_lower for p in _BOT_UA_PATTERNS)


def build_click_url(token: str) -> str:
    return f"{BACKEND_BASE_URL}/phishing/click/{token}"


def build_landing_url(caught: bool = True) -> str:
    param = "caught=1" if caught else "invalid=1"
    return f"{PUBLIC_APP_URL}/phishing-landing?{param}"


def render_email_html(html_body: str, tracking_url: str, recipient_name: str) -> str:
    return (
        html_body
        .replace("{{tracking_url}}", tracking_url)
        .replace("{{recipient_name}}", recipient_name)
    )


def record_click(db: Session, token: str, ip: str, user_agent: str) -> models.PhishingTarget | None:
    target = db.query(models.PhishingTarget).filter_by(tracking_token=token).first()
    if target is None:
        return None

    if is_bot_ua(user_agent):
        logger.info("Bot UA ignored for token=%s ua=%.60s", token[:8], user_agent)
        return target

    if target.clicked_at is None:
        target.clicked_at = datetime.now(timezone.utc)
        target.click_ip = ip[:64] if ip else None
        target.click_user_agent = (user_agent or "")[:500]
        db.commit()
        logger.info("Phishing click: campaign=%s user=%s", target.campaign_id, target.user_id)

    return target
