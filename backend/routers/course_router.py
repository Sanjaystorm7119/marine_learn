from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

import models
import schemas
from database import get_db
from middlewares.auth_middleware import get_current_user
from middlewares.admin_middleware import require_admin

router = APIRouter(prefix="/courses", tags=["courses"])


# ── Public / crew endpoints ────────────────────────────────────────────────────

@router.get("/", response_model=list[schemas.StudyMaterialSummary])
def list_materials(
    role: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Return all study materials.
    Optionally filter by target_role (e.g. ?role=crew).
    Any authenticated user can call this.
    """
    query = db.query(models.StudyMaterial).order_by(models.StudyMaterial.order_index)
    materials = query.all()
    if role:
        role_norm = role.lower().strip()
        if role_norm == "officers": role_norm = "officer"
        elif role_norm == "department head": role_norm = "department_head"
        elif role_norm == "crews": role_norm = "crew"
        
        def match_role(r):
            r_norm = r.lower().strip()
            if r_norm == "officers": r_norm = "officer"
            elif r_norm == "department head": r_norm = "department_head"
            elif r_norm == "crews": r_norm = "crew"
            return r_norm
            
        materials = [m for m in materials if role_norm in [match_role(tr) for tr in (m.target_roles or [])]]
    return materials


@router.get("/my", response_model=list[schemas.StudyMaterialSummary])
def list_my_materials(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return materials assigned to the calling user's role."""
    all_materials = (
        db.query(models.StudyMaterial)
        .order_by(models.StudyMaterial.order_index)
        .all()
    )
    user_role = current_user.role.lower().strip()
    if user_role == "officers":
        user_role = "officer"
    elif user_role == "department head":
        user_role = "department_head"
    elif user_role == "crews":
        user_role = "crew"
        
    def match_role(r):
        r_norm = r.lower().strip()
        if r_norm == "officers": r_norm = "officer"
        elif r_norm == "department head": r_norm = "department_head"
        elif r_norm == "crews": r_norm = "crew"
        return r_norm
        
    return [m for m in all_materials if user_role in [match_role(tr) for tr in (m.target_roles or [])]]


@router.get("/{material_key}", response_model=schemas.StudyMaterialResponse)
def get_material(
    material_key: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return a full material with chapters, lessons, and quiz questions."""
    material = (
        db.query(models.StudyMaterial)
        .options(
            selectinload(models.StudyMaterial.chapters).selectinload(models.Chapter.lessons),
            selectinload(models.StudyMaterial.quiz_questions),
        )
        .filter(models.StudyMaterial.material_key == material_key)
        .first()
    )
    if not material:
        raise HTTPException(status_code=404, detail="Study material not found")
    user_role = current_user.role.lower().strip()
    if user_role == "officers":
        user_role = "officer"
    elif user_role == "department head":
        user_role = "department_head"
    elif user_role == "crews":
        user_role = "crew"

    def match_role(r):
        r_norm = r.lower().strip()
        if r_norm == "officers": r_norm = "officer"
        elif r_norm == "department head": r_norm = "department_head"
        elif r_norm == "crews": r_norm = "crew"
        return r_norm

    normalized_target_roles = [match_role(tr) for tr in (material.target_roles or [])]
    if user_role not in normalized_target_roles:
        raise HTTPException(status_code=403, detail="Access denied")
    return material


# ── Admin-only endpoints ───────────────────────────────────────────────────────

@router.patch("/{material_key}/roles", response_model=schemas.StudyMaterialSummary)
def update_target_roles(
    material_key: str,
    roles: list[str],
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Admin: update which roles can see this material."""
    material = (
        db.query(models.StudyMaterial)
        .filter(models.StudyMaterial.material_key == material_key)
        .first()
    )
    if not material:
        raise HTTPException(status_code=404, detail="Study material not found")
    material.target_roles = roles
    db.commit()
    db.refresh(material)
    return material
