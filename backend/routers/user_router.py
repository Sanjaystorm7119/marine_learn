"""
user_router.py
──────────────
All /users/* routes. Access is per-route:
  - GET  /users/me              → any authenticated user (get_current_user)
  - GET  /users/                → admin only (require_admin)
  - POST /users/                → admin only (require_admin)
  - GET  /users/{user_id}       → admin only (require_admin)
  - PUT  /users/{user_id}/role  → admin only (require_admin)
  - DELETE /users/{user_id}     → admin only (require_admin)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
import models
import schemas
from database import get_db
from middlewares.auth_middleware import get_current_user
from middlewares.admin_middleware import require_admin

router = APIRouter(prefix="/users", tags=["Users"])


# ── Self ──────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ── Admin-only user management ────────────────────────────────────────────────

@router.get("/")
def get_all_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    users = db.query(models.User).all()
    return [
        {"id": u.id, "full_name": u.full_name, "email": u.email, "role": u.role}
        for u in users
    ]


@router.post("/")
def create_user(
    user_data: schemas.AdminUserCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    existing = crud.get_user_by_email(db, user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=crud.hash_password(user_data.password),
        role=user_data.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "full_name": new_user.full_name,
            "email": new_user.email, "role": new_user.role}


@router.get("/{user_id}")
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "full_name": user.full_name,
            "email": user.email, "role": user.role}


@router.put("/{user_id}/role")
def update_user_role(
    user_id: int,
    role_update: schemas.RoleUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return {"id": user.id, "full_name": user.full_name,
            "email": user.email, "role": user.role}


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
