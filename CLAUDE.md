# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MarineLearn — a maritime crew e-learning platform (LMS) focused on cybersecurity training. Full-stack: React + Vite frontend, Python FastAPI backend, PostgreSQL database.

## Commands

### Frontend (`frontend/`)
```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build
```

### Backend (`backend/`)
```bash
source venv/Scripts/activate   # Activate virtualenv (Windows bash)
pip install -r req.txt         # Install dependencies
uvicorn main:app --reload      # Dev server at http://localhost:8000
```

## Architecture

### Frontend (`frontend/src/`)
- **Entry**: `main.jsx` → `App.jsx` (React Router v7 SPA)
- **Auth**: JWT stored in `localStorage` (`token`, `role`, `full_name`); passed as `Authorization: Bearer` header
- **API**: Fetch calls hardcoded to `http://localhost:8000` (crew routes) and `http://127.0.0.1:8000` (admin routes)
- **Course data**: Entirely hardcoded in `components/courseData.js` — not fetched from backend
- **Styling**: Per-component CSS in `src/pages/`; Radix UI primitives in `src/components/ui/`
- **State**: Local `useState` + `localStorage` only — no Redux or Context API

### Routing (`App.jsx`)

**PublicLayout** (shows nav/footer on most routes, hides on `/login`, `/signup`, `/dashboard`, `/admin/*`):

| Path | Component | Notes |
|---|---|---|
| `/` | `home.jsx` | Landing page |
| `/login` | `login.jsx` | No nav/footer |
| `/signup` | `signup.jsx` | No nav/footer |
| `/dashboard` | `dashboard.jsx` | No nav/footer; redirects to `/login` if no token |
| `/certificates` | `certificate.jsx` | |
| `/coursepage` | `Coursecatalog.jsx` | Course catalog |
| `/settings` | `settings.jsx` | |
| `/learn/:departmentId/:courseId` | `Learningpage.jsx` | Video + lesson viewer |
| `/course/:departmentId/:courseId` | `courses.jsx` | Chapter/lesson navigator |

**AdminLayout** (dedicated sidebar layout, separate from PublicLayout):

| Path | Component |
|---|---|
| `/admin/` | `AdminDashboard.jsx` |
| `/admin/users` | `AdminUsers.jsx` |
| `/admin/users/:id` | `AdminUserDetails.jsx` |

### Frontend Components (`src/components/`)

**Pages / Views:**
- `home.jsx` — landing page
- `dashboard.jsx` — student dashboard (stats, continue-learning, for-you section)
- `login.jsx` — login form
- `signup.jsx` — registration form
- `settings.jsx` — user settings
- `Coursecatalog.jsx` — course catalog with filtering
- `courses.jsx` — course detail and chapter/lesson list
- `Learningpage.jsx` — video player + lesson content
- `certificate.jsx` — certificate display/download

**Layout / Navigation:**
- `AdminLayout.jsx` — admin sidebar + topbar + logout
- `nav.jsx` — main nav bar
- `footer.jsx` — footer
- `sidenav.jsx` — dashboard sidebar

**Admin:**
- `AdminDashboard.jsx` — stats overview
- `AdminUsers.jsx` — user CRUD table
- `AdminUserDetails.jsx` — single user detail view

**UI Primitives (`src/components/ui/`):**
- `button.jsx`, `card.jsx`, `input.jsx`, `label.jsx`, `separator.jsx`, `switch.jsx` — Radix UI wrappers

**Data & Utils:**
- `courseData.js` — all course content (see below)
- `lib/utils.js` — shared utilities

### Course Data (`courseData.js`)

6 departments × 7–8 courses each (43 total), all cybersecurity-themed:

| Department ID | Courses (count) | Sample topics |
|---|---|---|
| `deck` | 7 | ECDIS security, AIS spoofing, GNSS vulnerability |
| `engine` | 7 | SCADA security, OT network defense, PLC malware |
| `safety` | 7 | STCW cyber safety, ISM code compliance |
| `navigation` | 7 | Radar threats, VDR data protection, GMDSS |
| `electrical` | 7 | Power management security, network segmentation |
| `catering` | 8 | Crew data privacy, social engineering, Wi-Fi safety |

**Course object shape:**
```js
{
  id: string,
  title: string,
  icon: string,           // emoji
  description: string,
  totalDuration: string,  // e.g. "1h 20min"
  chapters: [{
    id, title,
    lessons: [{ id, title, duration, videoUrl?, topics: string[] }]
  }],
  quizPool: Question[]    // 15 generic MCQ questions per course
}
```

**Helper exports:** `coursesByDepartment`, `getDepartmentTitle(id)`, `getCourseData(deptId, courseId)`, `generateQuizPool(courseTitle)`

### Backend (`backend/`)

```
backend/
├── main.py                  # App entry: CORS, router mounting, table creation, GET /
├── middlewares/
│   ├── auth_middleware.py   # get_current_user — decodes JWT → fetches User row
│   └── admin_middleware.py  # require_admin — Depends(get_current_user), checks role == "admin"
├── routers/
│   ├── auth_router.py       # POST /signup, POST /login            (public)
│   ├── user_router.py       # /users/* endpoints
│   └── admin_router.py      # GET /admin/stats                     (admin only)
├── crud.py                  # hash_password, create_user, get_user_by_email, verify_password
├── models.py                # SQLAlchemy ORM — User table
├── schemas.py               # Pydantic: UserCreate, Login, Token, UserResponse, AdminUserCreate, RoleUpdate
├── auth.py                  # create_access_token, SECRET_KEY, ALGORITHM, token expiry
└── database.py              # PostgreSQL engine, SessionLocal, get_db, Base
```

### Backend API Reference

**Root**

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/` | — | `{message: "MarineLearn API running"}` |

**Auth (`auth_router.py`)**

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/signup` | — | `UserCreate` | `UserResponse` |
| POST | `/login` | — | `Login` | `{access_token, token_type, role, full_name}` |

**Users (`user_router.py`, prefix `/users`)**

| Method | Path | Guard | Body | Response |
|---|---|---|---|---|
| GET | `/users/me` | `get_current_user` | — | `UserResponse` |
| GET | `/users/` | `require_admin` | — | `[UserResponse]` |
| POST | `/users/` | `require_admin` | `AdminUserCreate` | `UserResponse` |
| GET | `/users/{user_id}` | `require_admin` | — | `UserResponse` |
| PUT | `/users/{user_id}/role` | `require_admin` | `RoleUpdate` | `UserResponse` |
| DELETE | `/users/{user_id}` | `require_admin` | — | `{message: "User deleted successfully"}` |

**Admin (`admin_router.py`, prefix `/admin`)**

| Method | Path | Guard | Response |
|---|---|---|---|
| GET | `/admin/stats` | `require_admin` | `{total_users, roles: {role: count}}` |

### Data Models

**User table (`models.py`)**
- `id` Integer PK
- `full_name` String
- `email` String (unique, indexed)
- `hashed_password` String (bcrypt)
- `role` String (default `"crew"`)

**Pydantic schemas (`schemas.py`)**

| Schema | Fields |
|---|---|
| `UserCreate` | `full_name`, `email: EmailStr`, `password` |
| `Login` | `email: EmailStr`, `password` |
| `Token` | `access_token`, `token_type` |
| `UserResponse` | `id`, `full_name`, `email`, `role` (orm_mode) |
| `AdminUserCreate` | `full_name`, `email`, `password`, `role="crew"` |
| `RoleUpdate` | `role` |

### Auth & Middleware

**JWT config (`auth.py`):** HS256, 60-minute expiry. Token payload: `{"sub": user.email, "exp": ...}`.

**`get_current_user`** — HTTPBearer → decode JWT → look up user by email → return User or 401.

**`require_admin`** — `Depends(get_current_user)` → check `role == "admin"` → return user or 403.

**Dependency chain:**
```
require_admin
    └── get_current_user
            ├── HTTPBearer (Authorization header)
            └── get_db (Session)
```

**Auth flow:** `POST /login` → JWT → localStorage → `Authorization: Bearer` → `get_current_user` → `require_admin`.

### CORS (`main.py`)
Allowed origins: `http://localhost:5173`, `http://localhost:5174`, `http://127.0.0.1:5173`, `http://127.0.0.1:5174`. All methods and headers allowed. Credentials allowed.

### Database
PostgreSQL (`marinelearn_db2`). Connection string hardcoded in `database.py`. Schema auto-created via `metadata.create_all()` on startup — no migration tooling.

### Key Dependencies
- **Frontend**: React 19, React Router 7, Framer Motion, Recharts, Lucide React, Radix UI
- **Backend**: FastAPI 0.133, SQLAlchemy 2.0, psycopg2, PyJWT, passlib/bcrypt, Uvicorn

## Known Issues / Constraints
- JWT secret key and DB password are **hardcoded** — no `.env` file
- Backend URL hardcoded as `http://localhost:8000` (crew) / `http://127.0.0.1:8000` (admin) in components
- All course content is **static frontend data** — no backend course/enrollment/progress tracking
- No test suite
- No database migration tooling (`metadata.create_all()` only)
- No rate limiting on auth endpoints
- JWT stored in `localStorage` (XSS risk)
- Frontend has no route guards for admin pages beyond token presence checks
