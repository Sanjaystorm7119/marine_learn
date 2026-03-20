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
- **API**: Fetch calls hardcoded to `http://localhost:8000` (crew/auth routes) and `http://127.0.0.1:8000` (admin routes)
- **Course data**: Entirely hardcoded in `components/courseData.js` — not fetched from backend
- **Styling**: Per-component CSS in `src/pages/`; Radix UI primitives in `src/components/ui/`
- **State**: Local `useState` + `localStorage` only — no Redux or Context API
- **Animations**: Framer Motion (`motion`, `AnimatePresence`) used throughout
- **Icons**: Lucide React (most components); some pages use 23 custom inline SVG icon wrappers

### Directory Structure

```
frontend/src/
├── main.jsx                   # React entry point
├── App.jsx                    # Router config (all routes defined here)
├── App.css
├── index.css                  # Global CSS reset/base
├── assets/                    # Static images + 2 MP4 video files
│   ├── hero-ship.jpg
│   ├── course-{dept}.jpg      # 6 course thumbnail images
│   ├── dept-{dept}.jpg        # 6 department images
│   ├── GPS Spoofing Defense - Lesson 1 Summary_720p_caption.mp4
│   ├── GNSS Vulnerability Analysis - Lesson 2 Summary_720p_caption.mp4
│   └── react.svg
├── components/                # All page + layout components
│   ├── courseData.js          # All 43 courses hardcoded here
│   ├── home.jsx
│   ├── login.jsx
│   ├── signup.jsx
│   ├── dashboard.jsx          # Student hub (includes live search)
│   ├── Learningpage.jsx       # Video player + lesson viewer
│   ├── courses.jsx            # Chapter/lesson navigator + quiz
│   ├── Coursecatalog.jsx      # Course catalog with department tabs
│   ├── certificate.jsx        # Certificate display/download
│   ├── settings.jsx           # User settings (local state only)
│   ├── nav.jsx                # Top navbar (public pages)
│   ├── footer.jsx             # Footer (public pages)
│   ├── sidenav.jsx            # Reusable dashboard sidebar
│   ├── AdminLayout.jsx        # Admin wrapper (sidebar + topbar)
│   ├── AdminDashboard.jsx     # Admin stats (Recharts charts)
│   ├── AdminUsers.jsx         # User CRUD table
│   ├── AdminUserDetails.jsx   # Single user detail/edit view
│   └── ui/                    # Radix UI primitive wrappers
│       ├── button.jsx
│       ├── card.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── separator.jsx
│       └── switch.jsx
├── hooks/
│   └── useDebounce.js         # Custom debounce hook (used in dashboard search)
├── lib/
│   └── utils.js               # cn() helper (clsx + tailwind-merge)
└── pages/                     # Per-component CSS files
    ├── home.css
    ├── login.css
    ├── signup.css
    ├── dashboard.css
    ├── Learningpage.css
    ├── courses.css
    ├── coursecatalog.css
    ├── certificate.css
    ├── settings.css
    ├── nav.css
    ├── footer.css
    ├── sidenav.css
    └── admin.css              # Shared CSS for all admin pages
```

### Routing (`App.jsx`)

**PublicLayout** (shows nav/footer on most routes, hides on `/login`, `/signup`, `/dashboard`, `/admin/*`):

| Path | Component | Notes |
|---|---|---|
| `/` | `home.jsx` | Landing page — hero, stats, featured courses, department cards, testimonials |
| `/login` | `login.jsx` | No nav/footer |
| `/signup` | `signup.jsx` | No nav/footer |
| `/dashboard` | `dashboard.jsx` | No nav/footer; redirects to `/login` if no token |
| `/certificates` | `certificate.jsx` | |
| `/coursepage` | `Coursecatalog.jsx` | Course catalog with department tabs |
| `/settings` | `settings.jsx` | |
| `/learn/:departmentId/:courseId` | `Learningpage.jsx` | Video + lesson viewer |
| `/course/:departmentId/:courseId` | `courses.jsx` | Chapter/lesson navigator + quiz |

**AdminLayout** (dedicated sidebar layout, separate from PublicLayout):

| Path | Component | Notes |
|---|---|---|
| `/admin` | `AdminDashboard.jsx` | Stats + Recharts pie/bar charts |
| `/admin/users` | `AdminUsers.jsx` | User CRUD table |
| `/admin/users/:id` | `AdminUserDetails.jsx` | Single user detail |

> **Note:** AdminLayout sidebar shows 4 nav items (Dashboard, User Management, Course Management, System Settings) but only Dashboard and User Management are implemented — Course Management and System Settings have no routes.

### Frontend Components — Key Details

#### `dashboard.jsx`
- Fetches user name from `GET /users/me` on mount; redirects to `/login` if token missing/invalid
- Contains a **live course/module search** built on a static index:
  - `searchIndex` is built at module load time (IIFE) by flattening `coursesByDepartment` into `courses[]` and `modules[]`
  - `useDebounce(query, 280)` delays `runSearch()` until 280 ms of input inactivity
  - `runSearch()` filters both arrays by title, description, department, and lesson topics; caps at 5 results each
  - Dropdown (Framer Motion `AnimatePresence`) shows categorised results — Courses link to `/course/:dept/:id`, Modules link to `/learn/:dept/:id`
  - Closes on outside `mousedown`; X button clears query
- Mock stats, continue-learning cards, and "For You" course cards (no backend integration)

#### `Learningpage.jsx` and `courses.jsx`
- Both define 23 **inline custom SVG icon components** (`IconBookOpen`, `IconPlay`, `IconPause`, `IconAward`, etc.) instead of importing from lucide-react — they duplicate lucide icon paths directly
- `courses.jsx` runs the full quiz flow: `stage` state cycles through `"overview"` → `"lessons"` → `"quiz"` → certificate preview; quiz score is not persisted

#### `Learningpage.jsx`
- Custom HTML5 video player with playback controls
- Only 2 courses have actual `videoUrl` (MP4 files bundled in `assets/`); all others have `videoUrl: undefined`

#### `AdminDashboard.jsx`
- Calls `GET http://127.0.0.1:8000/admin/stats` with Bearer token
- Renders `PieChart` and `BarChart` from Recharts based on `roles` data

#### `AdminUsers.jsx`
- All admin API calls use `http://127.0.0.1:8000` (not `localhost`)
- Role dropdown offers: `"Crews"`, `"Officers"`, `"Department Head"`, `"Admin"` — these are UI labels only; the backend stores the raw value as the `role` string
- `DELETE /users/{id}` does browser `confirm()` before sending

#### `settings.jsx`
- Entirely local state — no API calls
- Toggles for: notifications, security (2FA, session timeout), display (compact mode, animations)
- "Sign Out" clears `localStorage` and navigates to `/login`

#### `certificate.jsx`
- All certificate data is frontend mock data (12 completed, 3 pending)
- "Download" button exists but has no backend integration

### Frontend API Calls Summary

| Component | Method | URL | Auth |
|---|---|---|---|
| `login.jsx` | POST | `http://localhost:8000/login` | None |
| `signup.jsx` | POST | `http://localhost:8000/signup` | None |
| `dashboard.jsx` | GET | `http://localhost:8000/users/me` | Bearer |
| `AdminDashboard.jsx` | GET | `http://127.0.0.1:8000/admin/stats` | Bearer |
| `AdminUsers.jsx` | GET | `http://127.0.0.1:8000/users/` | Bearer |
| `AdminUsers.jsx` | POST | `http://127.0.0.1:8000/users/` | Bearer |
| `AdminUsers.jsx` | DELETE | `http://127.0.0.1:8000/users/{id}` | Bearer |

> All other components (courses, learning page, catalog, certificates, settings) make **no API calls**.

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

**Video content:** Only 2 lessons have actual `videoUrl` values (MP4 assets bundled in `src/assets/`). Both are in the `deck/ecdis-cybersecurity` course. All other lessons have `videoUrl: undefined`.

**Helper exports:** `coursesByDepartment`, `getDepartmentTitle(id)`, `getCourseData(deptId, courseId)`, `generateQuizPool(courseTitle)`

### Custom Hooks (`src/hooks/`)

| Hook          | File             | Purpose |
|---            |---               |---      |
| `useDebounce` | `useDebounce.js` | Delays a value update by N ms (default 300ms) after the last change. Used by dashboard search to avoid filtering on every keystroke.|

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
├── database.py              # PostgreSQL engine, SessionLocal, get_db, Base
└── req.txt                  # pip requirements
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

**JWT config (`auth.py`):** HS256, 60-minute expiry. Token payload: `{"sub": user.email, "exp": ...}`. Secret key hardcoded as `"my_super_secret_marine_key_123"`.

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
PostgreSQL (`marinelearn_db2`). Connection string hardcoded in `database.py` (host: `localhost`, user: `postgres`, password: `12345`). Schema auto-created via `metadata.create_all()` on startup — no migration tooling.

### Key Dependencies

**Frontend:**
- React 19, React Router 7, Framer Motion 12, Recharts 3, Lucide React, Radix UI (6 primitives)
- clsx, tailwind-merge (used in `lib/utils.js` cn() helper only — **Tailwind CSS is not active**)
- Vite (build tool)

**Backend:**
- FastAPI 0.133, SQLAlchemy 2.0, psycopg2, PyJWT, passlib/bcrypt, Uvicorn

## Known Issues / Constraints

- JWT secret key and DB password are **hardcoded** — no `.env` file
- Backend URL hardcoded as `http://localhost:8000` (auth/crew) vs `http://127.0.0.1:8000` (admin) — same server, different host strings
- All course content is **static frontend data** — no backend course/enrollment/progress/quiz tracking
- Only 2 of 43 courses have actual video content (MP4 files in `assets/`) — rest have `videoUrl: undefined`
- Quiz scores and lesson completion are ephemeral (React state only, lost on page refresh)
- Certificate data is entirely mock — no backend integration
- AdminLayout sidebar shows "Course Management" and "System Settings" nav items that have no implemented routes
- `Learningpage.jsx` and `courses.jsx` each define 23 custom inline SVG icon components (duplicating lucide-react paths) — maintenance burden if icons need updating
- Tailwind CSS is listed as a dependency but is not configured/used — styling is pure CSS modules
- No test suite
- No database migration tooling (`metadata.create_all()` only)
- No rate limiting on auth endpoints
- JWT stored in `localStorage` (XSS risk)
- Frontend has no route guards for admin pages beyond token presence checks — role is only enforced server-side
