"""
auth_router.py
──────────────
Public routes — no authentication required.
    POST /signup
    POST /login
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import schemas
from auth import create_access_token
from database import get_db

router = APIRouter(tags=["Auth"])


@router.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)


@router.post("/login")
def login(user: schemas.Login, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")
    if not crud.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid password")
    access_token = create_access_token(data={"sub": db_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role,
        "full_name": db_user.full_name,
    }
