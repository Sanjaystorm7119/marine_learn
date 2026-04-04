"""
admin_router.py
───────────────
Routes for admin-specific operations (not resource management).
Every route depends on `require_admin`.

    GET /admin/stats
"""

from fastapi import APIRouter, Depends,HTTPException 
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
        # 1. Find all users with this role
        users_with_role = db.query(models.User).filter(func.lower(models.User.role) == func.lower(r.name)).all()
        
        # 2. Grab the lead from the first user (or use default if no users exist)
        current_lead = "Will be assigned by admin"
        if len(users_with_role) > 0 and users_with_role[0].role_lead:
            current_lead = users_with_role[0].role_lead

        result.append({
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "lead": current_lead, # <-- FIXED: Now pulls from the User table!
            "userCount": len(users_with_role)
        })
    return result

@router.post("/roles", response_model=schemas.AdminRoleResponse)
def create_new_role(role: schemas.AdminRoleCreate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    # Check if role name already exists
    existing = db.query(models.Role).filter(func.lower(models.Role.name) == func.lower(role.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")
    
    new_role = crud.create_role(db, role)
    return {
        "id": new_role.id,
        "name": new_role.name,
        "description": new_role.description,
        "lead": role.lead, 
        "userCount": 0
    }

@router.put("/roles/{role_id}", response_model=schemas.AdminRoleResponse)
def update_existing_role(role_id: int, role_update: schemas.AdminRoleUpdate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    updated_role = crud.update_role(db, role_id, role_update)
    if not updated_role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # --- MAGIC: Sync the new lead to all users with this role! ---
    users_with_role = db.query(models.User).filter(func.lower(models.User.role) == func.lower(updated_role.name)).all()
    for u in users_with_role:
        u.role_lead = role_update.lead
    db.commit()
    # -------------------------------------------------------------

    return {
        "id": updated_role.id,
        "name": updated_role.name,
        "description": updated_role.description,
        "lead": role_update.lead,
        "userCount": len(users_with_role)
    }

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

# --- NEW: GET ALL USERS FOR A SPECIFIC ROLE ---
@router.get("/roles/{role_id}/users", response_model=list[schemas.UserResponse])
def get_users_in_role(role_id: int, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    # 1. Find the role
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # 2. Find all users who have this role name
    users = db.query(models.User).filter(func.lower(models.User.role) == func.lower(role.name)).all()
    
    return users

@router.put("/users/{user_id}/lead", response_model=schemas.UserResponse)
def update_user_lead_endpoint(user_id: int, lead_update: schemas.UserLeadUpdate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    updated_user = crud.update_user_lead(db, user_id, lead_update.lead)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return updated_user

# (Add this to the very bottom of routers/admin_router.py)

@router.get("/user-courses", response_model=list[schemas.UserCourseManagementResponse])
def get_user_course_management_data(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    result =[]

    for user in users:
        assignments = db.query(models.UserCourseAssignment).filter(models.UserCourseAssignment.user_id == user.id).all()
        courses_data =[]
        total_progress_sum = 0

        for assign in assignments:
            module = db.query(models.StudyModule).filter(models.StudyModule.id == assign.module_id).first()
            if not module:
                continue
                
            total_topics = db.query(models.StudyTopic).filter(models.StudyTopic.module_id == module.id).count()
            
            completed_topics = db.query(models.UserTopicProgress).join(models.StudyTopic).filter(
                models.UserTopicProgress.user_id == user.id,
                models.StudyTopic.module_id == module.id
            ).count()

            progress = int((completed_topics / total_topics * 100)) if total_topics > 0 else 0
            total_progress_sum += progress
            status = "completed" if progress == 100 else ("in-progress" if progress > 0 else "not-started")

            quiz = db.query(models.UserQuizAttempt).filter(
                models.UserQuizAttempt.user_id == user.id, 
                models.UserQuizAttempt.module_id == module.id
            ).order_by(models.UserQuizAttempt.attempted_at.desc()).first()

            quiz_score = int((quiz.score / quiz.total * 100)) if quiz and quiz.total > 0 else None

            courses_data.append({
                "courseId": module.id,
                "courseTitle": module.title,
                "completedModules": completed_topics,
                "totalModules": total_topics,
                "completedLessons": completed_topics,
                "totalLessons": total_topics,
                "progress": progress,
                "status": status,
                "quizScore": quiz_score
            })

        overall_progress = int(total_progress_sum / len(courses_data)) if courses_data else 0

        result.append({
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role.lower(),
            "rank": user.role_lead,
            "overallProgress": overall_progress,
            "streak": 0,
            "courses": courses_data
        })

    return result

@router.post("/assign-courses")
def assign_courses_to_users(payload: schemas.CourseAssignmentCreate, db: Session = Depends(get_db)):
    assigned_count = 0
    for uid in payload.user_ids:
        for mid in payload.module_ids:
            existing = db.query(models.UserCourseAssignment).filter(
                models.UserCourseAssignment.user_id == uid,
                models.UserCourseAssignment.module_id == mid
            ).first()
            
            if not existing:
                new_assign = models.UserCourseAssignment(user_id=uid, module_id=mid)
                db.add(new_assign)
                assigned_count += 1
                
    db.commit()
    return {"message": f"Successfully assigned {assigned_count} new course records."}