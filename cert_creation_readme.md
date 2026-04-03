# Certificate Creation — How It Works

## Overview

Course completion certificates are generated client-side using `html2canvas` + `jsPDF` (bundled via `html2pdf.js`). No server-side PDF rendering is involved. Certificates are persisted in the PostgreSQL database and can be re-downloaded any time from the `/certificates` page.

---

## Entry Points

There are two places in the app where a certificate can be earned:

| Page | File | Trigger |
|------|------|---------|
| Learning Page | `frontend/src/components/Learningpage.jsx` | Quiz score ≥ 70% (7/10) |
| Study Materials | `frontend/src/components/StudyMaterials.jsx` | Module quiz score ≥ 60% |

---

## End-to-End Flow

```
User completes course / passes quiz
            │
            ▼
  submitQuiz() / handleQuizSubmit()
            │
            │  score meets threshold?
            ▼
  POST /study/certificates
  { course_title: "..." }
  Authorization: Bearer <token>
            │
            ▼
  ┌─────────────────────────────────────────┐
  │  Backend (study_router.py)              │
  │                                         │
  │  1. Decode JWT → get current user       │
  │  2. Query: existing cert for            │
  │     (user_id + course_title)?           │
  │     YES → return existing (idempotent)  │
  │     NO  → create new Certificate row:  │
  │       • user_id                         │
  │       • course_title                    │
  │       • issued_at = datetime.utcnow()   │
  │       • certificate_number = MAR-XXXXXX │
  │  3. Return CertificateResponse JSON     │
  └─────────────────────────────────────────┘
            │
            ▼
  Frontend receives:
  {
    id, user_full_name, course_title,
    issued_at, certificate_number
  }
            │
            ▼
  <CertificateTemplate ref={certRef}
    recipientName={user_full_name}
    courseName={course_title}
    issuedAt={issued_at}
    certificateNumber={certificate_number}
  />
  (rendered as HTML in the DOM)
            │
            ▼
  User clicks "Download PDF"
            │
            ▼
  downloadCertificatePDF(certRef.current, filename)
            │
            ├─► html2canvas screenshots the DOM node
            │     scale: 2  (2× resolution for sharpness)
            │     useCORS: true
            │
            ├─► Canvas bitmap → JPEG (quality 0.98)
            │
            ├─► jsPDF embeds image into A4 landscape PDF
            │     format: a4, orientation: landscape
            │     margin: 5mm on all sides
            │
            └─► .save() → browser download dialog
                  filename: certificate-MAR-XXXXXXXX.pdf
```

---

## Backend

### Database Model — `backend/models.py`

```python
class Certificate(Base):
    __tablename__ = "certificates"

    id                 = Column(Integer, primary_key=True)
    user_id            = Column(Integer, ForeignKey("users.id"))
    course_title       = Column(String)          # stored directly, no FK to courses
    issued_at          = Column(DateTime, default=datetime.utcnow)
    certificate_number = Column(String, unique=True)   # e.g. MAR-A1B2C3D4

    # One certificate per user per course
    __table_args__ = (UniqueConstraint("user_id", "course_title"),)
```

### API Endpoints — `backend/routers/study_router.py`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/study/certificates` | Issue (or return existing) certificate for a course |
| `GET` | `/study/certificates` | List all certificates for the logged-in user |

Both require a valid `Authorization: Bearer <token>` header.

---

## Frontend

### Key Files

| File | Role |
|------|------|
| `frontend/src/components/CertificateTemplate.jsx` | React component that renders the visual certificate using inline styles only |
| `frontend/src/lib/downloadCertificate.js` | Utility that calls `html2pdf.js` to convert the DOM node to a PDF |
| `frontend/src/components/Learningpage.jsx` | Calls the API and renders the template after a course quiz pass |
| `frontend/src/components/StudyMaterials.jsx` | Same, for module quizzes |
| `frontend/src/components/certificate.jsx` | `/certificates` page — lists all earned certs, preview modal, download |

### Why Inline Styles in `CertificateTemplate`

`html2canvas` re-renders the element in a hidden clone before screenshotting. External stylesheet rules can be missed during that process. All styles are written inline so the certificate looks identical in the PDF regardless of the page context it renders in.

### `downloadCertificate.js` Options

```js
{
  margin: 5,                           // 5mm on all sides
  filename: "certificate-MAR-XXX.pdf",
  image:    { type: "jpeg", quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true }, // 2× for crisp text
  jsPDF:    { unit: "mm", format: "a4", orientation: "landscape" },
}
```

---

## Certificate Number Format

Generated at issuance time in the backend:

```python
f"MAR-{str(uuid.uuid4())[:8].upper()}"
# e.g. MAR-A1B2C3D4
```

- `MAR-` prefix (MarineLearn)
- 8 uppercase hex characters from a UUID4
- Stored as unique in the database — guaranteed no collisions

---

## Idempotency

Calling `POST /study/certificates` for the same user + course twice returns the **same** certificate (same number and issue date). The backend checks for an existing row before creating a new one. This means:

- Retaking a quiz after passing does not create a duplicate certificate
- The original issue date is preserved

---

## Tests

| Suite | Command | Count |
|-------|---------|-------|
| Backend (pytest) | `cd backend && python -m pytest tests/ -v` | 12 tests |
| Frontend (vitest) | `cd frontend && npm test` | 24 tests |

Backend tests use an in-memory SQLite database with `StaticPool` so no running PostgreSQL instance is required. The `postgresql.JSONB` type is patched to `JSON` at the top of `conftest.py` for SQLite compatibility.
