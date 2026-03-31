"""
admin_router.py
───────────────
Routes for admin-specific operations (not resource management).
Every route depends on `require_admin`.

    GET /admin/stats
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
import schemas # <-- Added schemas
import crud    # <-- Added crud
import models
from database import get_db
from middlewares.admin_middleware import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    total_users = db.query(models.User).count()
    role_counts = (
        db.query(models.User.role, func.count(models.User.id))
        .group_by(models.User.role)
        .all()
    )
    return {
        "total_users": total_users,
        "roles": {role: count for role, count in role_counts},
    }

# --- NEW: ROLE MANAGEMENT ENDPOINTS ---

@router.get("/roles", response_model=list[schemas.AdminRoleResponse])
def get_all_roles(db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    roles = crud.get_roles(db)
    result =[]
    for r in roles:
        # Count how many users have this role name (case-insensitive)
        user_count = db.query(models.User).filter(func.lower(models.User.role) == func.lower(r.name)).count()
        result.append({
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "lead": r.lead,
            "userCount": user_count
        })
    return result

@router.post("/roles", response_model=schemas.AdminRoleResponse)
def create_new_role(role: schemas.AdminRoleCreate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    # Check if role name already exists
    existing = db.query(models.Role).filter(func.lower(models.Role.name) == func.lower(role.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")
    
    new_role = crud.create_role(db, role)
    return {**new_role.__dict__, "userCount": 0}

@router.put("/roles/{role_id}", response_model=schemas.AdminRoleResponse)
def update_existing_role(role_id: int, role_update: schemas.AdminRoleUpdate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    updated_role = crud.update_role(db, role_id, role_update)
    if not updated_role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    user_count = db.query(models.User).filter(func.lower(models.User.role) == func.lower(updated_role.name)).count()
    return {**updated_role.__dict__, "userCount": user_count}

@router.delete("/roles/{role_id}")
def delete_existing_role(role_id: int, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # SECURITY: Prevent deleting a role if users are still assigned to it!
    user_count = db.query(models.User).filter(func.lower(models.User.role) == func.lower(role.name)).count()
    if user_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete role. {user_count} users are still assigned to it.")
        
    crud.delete_role(db, role_id)
    return {"message": "Role deleted successfully"}
