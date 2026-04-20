"""
Microsoft Graph API helpers for Teams meeting creation and email sending.
All calls use the client-credentials (app-only) OAuth2 flow.
"""

import time
from typing import Optional
import httpx

_token_cache: dict = {"token": None, "expires_at": 0}


def _get_app_token(tenant_id: str, client_id: str, client_secret: str) -> str:
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"] - 60:
        return _token_cache["token"]

    url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://graph.microsoft.com/.default",
    }
    resp = httpx.post(url, data=data, timeout=15)
    if resp.status_code != 200:
        _raise_auth_error(resp)

    body = resp.json()
    _token_cache["token"] = body["access_token"]
    _token_cache["expires_at"] = now + body.get("expires_in", 3600)
    return _token_cache["token"]


def _raise_auth_error(resp: httpx.Response) -> None:
    try:
        err = resp.json()
        code = err.get("error", "")
        desc = err.get("error_description", "")
    except Exception:
        code, desc = "unknown", resp.text[:200]

    if "AADSTS700016" in desc or "application" in desc.lower():
        raise ValueError("Invalid Client ID — app not found in the tenant.")
    if "AADSTS7000215" in desc or "invalid_client" in code:
        raise ValueError("Invalid Client Secret Value — check your credentials.")
    if "AADSTS90002" in desc or "tenant" in desc.lower():
        raise ValueError("Invalid Tenant ID — tenant not found.")
    raise ValueError(f"Authentication failed: {desc[:300] or code}")


def _raise_graph_error(resp: httpx.Response, context: str) -> None:
    try:
        err = resp.json().get("error", {})
        msg = err.get("message", resp.text[:300])
        code = err.get("code", "")
    except Exception:
        msg, code = resp.text[:300], ""

    if resp.status_code == 403:
        if "Authorization_RequestDenied" in code or "Forbidden" in msg:
            raise PermissionError(
                f"{context}: Admin consent may be missing for "
                "OnlineMeetings.ReadWrite.All or Mail.Send. "
                "Grant consent in Azure AD portal."
            )
        if "MailboxNotEnabledForRESTAPI" in code or "license" in msg.lower():
            raise PermissionError(
                f"{context}: The organizer mailbox is not licensed for Teams/Exchange REST API."
            )
    raise RuntimeError(f"{context} failed ({resp.status_code}): {msg}")


def test_credentials(tenant_id: str, client_id: str, client_secret: str) -> None:
    """Acquire a token — raises ValueError on invalid credentials."""
    _token_cache.clear()
    _token_cache.update({"token": None, "expires_at": 0})
    _get_app_token(tenant_id, client_id, client_secret)


def create_online_meeting(
    tenant_id: str,
    client_id: str,
    client_secret: str,
    organizer_user_id: str,
    subject: str,
    start_iso: str,
    end_iso: str,
) -> dict:
    token = _get_app_token(tenant_id, client_id, client_secret)
    url = f"https://graph.microsoft.com/v1.0/users/{organizer_user_id}/onlineMeetings"
    payload = {
        "subject": subject,
        "startDateTime": start_iso,
        "endDateTime": end_iso,
    }
    resp = httpx.post(
        url,
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=20,
    )
    if resp.status_code not in (200, 201):
        _raise_graph_error(resp, "Create Teams meeting")
    return resp.json()


def send_invitation_email(
    tenant_id: str,
    client_id: str,
    client_secret: str,
    organizer_user_id: str,
    organizer_display_name: str,
    subject: str,
    html_body: str,
    recipient_emails: list[str],
) -> None:
    token = _get_app_token(tenant_id, client_id, client_secret)
    url = f"https://graph.microsoft.com/v1.0/users/{organizer_user_id}/sendMail"
    to_recipients = [
        {"emailAddress": {"address": email}} for email in recipient_emails
    ]
    payload = {
        "message": {
            "subject": subject,
            "body": {"contentType": "HTML", "content": html_body},
            "toRecipients": to_recipients,
            "from": {
                "emailAddress": {
                    "address": organizer_user_id,
                    "name": organizer_display_name,
                }
            },
        },
        "saveToSentItems": True,
    }
    resp = httpx.post(
        url,
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=20,
    )
    if resp.status_code not in (200, 202):
        _raise_graph_error(resp, "Send invitation email")
