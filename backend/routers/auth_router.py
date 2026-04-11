"""
auth_router.py
──────────────
Public routes — no authentication required.
    POST /signup
    POST /login
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

import crud
import models
import schemas
from auth import create_access_token
from database import get_db

router = APIRouter(tags=["Auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/signup", response_model=schemas.UserResponse)
@limiter.limit("10/minute")
def signup(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)


@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, user: schemas.Login, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if not db_user or not crud.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = create_access_token(data={"sub": db_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role,
        "full_name": db_user.full_name,
    }
