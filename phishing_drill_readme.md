# Phishing Drill — How It Works

## Overview

The Phishing Drill is a **cybersecurity awareness tool** available exclusively to **superusers** under the `/phishing-drill` route (accessible via the Audits section in the SuperUser dashboard). It lets superusers launch simulated phishing email campaigns targeting all platform users, then track who clicked the bait links.

No real credentials are harvested. The goal is education: users who click are redirected to a landing page that explains what happened and how to spot phishing next time.

---

## Access

- **Who can use it:** Superusers only. All `/phishing/*` API endpoints are protected by `require_superuser` middleware.
- **Frontend route:** `/phishing-drill`
- **API prefix:** `/phishing`

---

## Core Concepts

### Templates

A **template** is a pre-written phishing email (HTML body + subject line). The system ships with **10 built-in templates** modelled on realistic maritime scenarios:

| Template | Scenario |
|---|---|
| Fake IT Password Reset | Account password expiry urgency |
| IT Security Alert | Suspicious login detected |
| Crew Salary Update | Payslip with "salary adjustment" |
| Port Authority Document Check | Pre-arrival compliance notice |
| STCW Certificate Renewal | Certificate expiry with regulatory warning |
| ISM Safety Management Audit | Overdue annual safety declaration |
| Fuel Supplier Invoice | Overdue invoice with financial urgency |
| Manning Agency Contract Update | Employment contract requiring signature |
| Vessel VPN / Remote Access Reset | VPN credential rotation |
| Company Travel Booking Confirmation | Crew rotation itinerary confirmation |

Built-in templates cannot be deleted. Superusers can also **create custom templates** with any HTML body, using two placeholders:

- `{{tracking_url}}` — replaced per-user with a unique traceable link
- `{{recipient_name}}` — replaced with the recipient's full name or email

### Campaigns

A **campaign** is a single drill run: one template sent to every user in the system. Each campaign has:

- A name chosen by the superuser
- A selected template
- Per-user tracking targets with email delivery status and click timestamps
- Aggregate stats: total sent, total clicked, click rate %

Campaigns belong to the superuser who launched them — superusers only see their own campaigns.

---

## End-to-End Flow

```
Superuser selects template
        │
        ▼
POST /phishing/campaigns
        │
        ├─ Creates PhishingCampaign row
        │
        └─ For each User in DB:
              ├─ Generates unique tracking token (32-byte URL-safe random)
              ├─ Creates PhishingTarget row (snapshots name, email, role)
              ├─ Builds tracking URL: GET /phishing/click/{token}
              ├─ Renders HTML email (replaces {{tracking_url}} and {{recipient_name}})
              └─ Sends email via Microsoft 365 (teams_service.send_invitation_email)
                      │
                      ▼
              Updates target.email_status = "sent" | "failed"
```

### When a User Clicks the Link

```
User clicks link in email
        │
        ▼
GET /phishing/click/{token}   ← PUBLIC endpoint, no auth
        │
        ├─ Looks up PhishingTarget by token
        │
        ├─ Checks User-Agent for known email security scanners/bots
        │   (Barracuda, Proofpoint, Mimecast, VirusTotal, etc.)
        │   └─ Bot detected → skip recording, still redirect
        │
        ├─ Records click (only the first real click):
        │   • clicked_at timestamp
        │   • click IP address
        │   • User-Agent string
        │
        ├─ Creates a Notification for the campaign creator:
        │   "{{name}} ({{email}}) clicked the bait link in campaign {{name}}"
        │   (deduplicated — one notification per user per campaign)
        │
        └─ Redirects user to PhishingLanding page
               ├─ ?caught=1  → "You clicked a simulated phishing link" + awareness tips
               └─ ?invalid=1 → "Link not found / expired"
```

### Landing Page (`/phishing-landing`)

When a user lands on this page with `?caught=1`:

- A banner slide-in toast alerts them this was a drill
- An explanation reassures them no real credentials were captured
- Five phishing red-flag tips are shown (sender address, hover links, urgency tactics, etc.)
- A note says their training team has been notified
- A "Return to Dashboard" button is shown

If the token was invalid or already used: a generic "link not found" state is shown.

---

## Superuser Dashboard (Phishing Drill Page)

The UI at `/phishing-drill` has two tabs:

### Campaigns Tab

Shows all campaigns launched by the current superuser with:
- Name, template used, emails sent, click count, click rate %, status badge
- Click any row to open a **Campaign Detail** modal showing per-user results:
  - Full name, email, role
  - Email delivery status (sent / failed)
  - Clicked indicator (✓ / ✗)
  - Copyable individual tracking URL for manual use
  - Visual click-rate progress bar

### Templates Tab

- Lists all templates (built-in + custom), searchable
- **Preview** any template rendered in a sandboxed iframe with placeholder values
- **Create** a custom template (name, subject, raw HTML)
- **Delete** custom templates (built-in templates are protected)

### Stats Bar

Four aggregate stats across all campaigns:
- Total Emails Sent
- Click Rate % (with absolute click count)
- Active Campaigns
- Total Campaigns

---

## Database Models

| Model | Purpose |
|---|---|
| `PhishingTemplate` | Template definitions; `is_builtin` flag guards deletion |
| `PhishingCampaign` | One row per drill run; tracks creator and aggregate counts |
| `PhishingTarget` | One row per user per campaign; holds token, delivery status, click data |

---

## Environment Variables

The email delivery step requires Microsoft 365 credentials set as environment variables:

| Variable | Purpose |
|---|---|
| `MS_TENANT_ID` | Azure AD tenant |
| `MS_CLIENT_ID` | App registration client ID |
| `MS_CLIENT_SECRET` | App registration secret |
| `MS_ORGANIZER_UPN` | Sender UPN (email address) |
| `MS_ORGANIZER_NAME` | Sender display name |
| `BACKEND_BASE_URL` | Base URL for generating tracking links (default: `http://localhost:8000`) |
| `PUBLIC_APP_URL` | Frontend URL for landing page redirect (default: `http://localhost:5173`) |

If any of the MS credentials are missing, launching a campaign returns `503 Service Unavailable`.

---

## Bot / Scanner Filtering

Email security gateways (Barracuda, Proofpoint, Mimecast, etc.) automatically follow links in emails to scan them. The click endpoint detects these by matching known User-Agent substrings and skips recording the click — preventing false positives in click stats.

Current filter patterns: `barracuda`, `proofpoint`, `mimecast`, `symantec`, `microsoft link preview`, `livelinkpreview`, `appengine-google`, `urlscan`, `virustotal`, `phishtank`, `safebrowsing`, `preview`, `scanner`, `crawler`, `bot`, `spider`, `linkcheck`.

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/phishing/templates` | Superuser | List all templates (seeds built-ins on first call) |
| `POST` | `/phishing/templates` | Superuser | Create a custom template |
| `DELETE` | `/phishing/templates/{id}` | Superuser | Delete a custom template (built-ins blocked) |
| `POST` | `/phishing/campaigns` | Superuser | Launch a new drill campaign |
| `GET` | `/phishing/campaigns` | Superuser | List own campaigns |
| `GET` | `/phishing/campaigns/{id}` | Superuser | Campaign detail + per-user targets |
| `GET` | `/phishing/click/{token}` | **Public** | Track click, redirect to landing page |
