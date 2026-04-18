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

# <-- NEW ENDPOINT FOR SETTINGS PAGE -->
@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    profile_data: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    if profile_data.vessel is not None:
        current_user.vessel = profile_data.vessel
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password")
def update_password(
    pass_data: schemas.UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Verify the current password is correct
    if not crud.verify_password(pass_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    # 2. Hash and save the new password
    current_user.hashed_password = crud.hash_password(pass_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}


# ── Admin-only user management ────────────────────────────────────────────────

@router.get("/")
def get_all_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    # Added order_by to sort IDs from 1 upwards
    users = db.query(models.User).order_by(models.User.id.asc()).all()
    return[
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
        role_lead="Will be assigned by admin",
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
    
    # 1. Delete all related records first to prevent Foreign Key database crashes
    db.query(models.UserTopicProgress).filter(models.UserTopicProgress.user_id == user_id).delete()
    db.query(models.UserQuizAttempt).filter(models.UserQuizAttempt.user_id == user_id).delete()
    db.query(models.UserCourseAssignment).filter(models.UserCourseAssignment.user_id == user_id).delete()
    db.query(models.Certificate).filter(models.Certificate.user_id == user_id).delete()
    db.query(models.Notification).filter(models.Notification.user_id == user_id).delete()
    
    # 2. Now it is safe to delete the user
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
