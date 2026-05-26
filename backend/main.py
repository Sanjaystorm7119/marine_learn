from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

import models
from database import engine
from database import SessionLocal
from routers import auth_router, user_router, admin_router, study_router, notification_router, teams_router, phishing_router, audits_router

# --- NEW IMPORTS FOR AUTOMATION ---
import os
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from services import recording_service
from routers.teams_router import _load_creds
# ----------------------------------

limiter = Limiter(key_func=get_remote_address)

models.Base.metadata.create_all(bind=engine)

# --- START AUTOMATION CODE ---
def auto_fetch_recordings():
    print("[Auto-Fetch] Checking for new Teams recordings...")
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        # Find meetings that have ended, are not cancelled, and don't have a recording yet
        pending_meetings = db.query(models.TeamsMeeting).filter(
            models.TeamsMeeting.end_time < now,
            models.TeamsMeeting.status != "cancelled",
            models.TeamsMeeting.recording_url == None
        ).all()

        if not pending_meetings:
            print("[Auto-Fetch] No pending recordings found.")
            return

        tenant_id, client_id, client_secret, organizer_id, _ = _load_creds()
        drive_id = os.getenv("SHAREPOINT_DRIVE_ID")

        for meeting in pending_meetings:
            if not meeting.graph_meeting_id:
                continue
            
            try:
                print(f"[Auto-Fetch] Processing meeting: {meeting.title}")
                embed_url = recording_service.fetch_and_upload_recording(
                    tenant_id=tenant_id, client_id=client_id, client_secret=client_secret,
                    organizer_id=organizer_id, graph_meeting_id=meeting.graph_meeting_id,
                    drive_id=drive_id, meeting_title=meeting.title, vessel_name=meeting.vessel
                )
                # Save to database!
                meeting.recording_url = embed_url
                db.commit()
                print(f"[Auto-Fetch] Success! Uploaded {meeting.title} to SharePoint.")
            except Exception as e:
                print(f"[Auto-Fetch] Recording not ready yet for {meeting.title}. Will retry later. Error: {str(e)}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the scheduler when the server starts
    scheduler = BackgroundScheduler()
    scheduler.add_job(auto_fetch_recordings, 'interval', minutes=15)
    scheduler.start()
    yield
    # Shut down the scheduler when the server stops
    scheduler.shutdown()
# --- END AUTOMATION CODE ---

# Notice we added lifespan=lifespan here!
app = FastAPI(title="MarineLearn API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    print(f"\n[422] {request.method} {request.url}")
    print(f"  raw body : {body!r}")
    print(f"  errors   : {exc.errors()}")
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(admin_router.router)
app.include_router(study_router.router)
app.include_router(notification_router.router)
app.include_router(teams_router.router)
app.include_router(phishing_router.router)
app.include_router(audits_router.router)


@app.get("/")
def read_root():
    return {"message": "MarineLearn API running"}
