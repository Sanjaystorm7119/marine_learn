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
    result = []
    for r in roles:
        user_count = db.query(models.User).filter(func.lower(models.User.role) == func.lower(r.name)).count()
        result.append({
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "lead": r.lead or "Will be assigned by admin",
            "userCount": user_count,
        })
    return result

@router.post("/roles", response_model=schemas.AdminRoleResponse)
def create_new_role(role: schemas.AdminRoleCreate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    existing = db.query(models.Role).filter(func.lower(models.Role.name) == func.lower(role.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")

    new_role = crud.create_role(db, role)
    return {
        "id": new_role.id,
        "name": new_role.name,
        "description": new_role.description,
        "lead": new_role.lead or "Will be assigned by admin",
        "userCount": 0,
    }

@router.put("/roles/{role_id}", response_model=schemas.AdminRoleResponse)
def update_existing_role(role_id: int, role_update: schemas.AdminRoleUpdate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    updated_role = crud.update_role(db, role_id, role_update)
    if not updated_role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Sync the new lead to all users with this role
    users_with_role = db.query(models.User).filter(func.lower(models.User.role) == func.lower(updated_role.name)).all()
    for u in users_with_role:
        u.role_lead = role_update.lead
    db.commit()

    return {
        "id": updated_role.id,
        "name": updated_role.name,
        "description": updated_role.description,
        "lead": updated_role.lead or "Will be assigned by admin",
        "userCount": len(users_with_role),
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
def get_user_course_management_data(db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    users = db.query(models.User).all()
    result = []

    for user in users:
        assignments = db.query(models.UserCourseAssignment).filter(
            models.UserCourseAssignment.user_id == user.id
        ).all()

        assigned_module_ids = {a.module_id for a in assignments}

        # Fetch all assigned modules in a single query
        assigned_modules = (
            db.query(models.StudyModule)
            .filter(models.StudyModule.id.in_(assigned_module_ids))
            .all()
        ) if assigned_module_ids else []

        # Group modules by their parent course_id.
        # Modules with NULL course_id are grouped under 0 (displayed as "Unassigned").
        course_module_map: dict[int, list] = {}
        for module in assigned_modules:
            cid = module.course_id if module.course_id else 0
            course_module_map.setdefault(cid, []).append(module)

        courses_data = []
        total_progress_sum = 0

        for course_id, modules in course_module_map.items():
            course = db.query(models.Course).filter(models.Course.id == course_id).first()
            course_title = course.title if course else "Assigned Modules"

            total_lessons = 0
            completed_lessons = 0
            completed_modules = 0
            quiz_scores = []
            modules_data = []

            for module in modules:
                module_total = db.query(models.StudyTopic).filter(
                    models.StudyTopic.module_id == module.id
                ).count()

                module_completed = (
                    db.query(models.UserTopicProgress)
                    .join(models.StudyTopic)
                    .filter(
                        models.UserTopicProgress.user_id == user.id,
                        models.StudyTopic.module_id == module.id,
                    )
                    .count()
                )

                total_quiz_questions = db.query(models.StudyQuizQuestion).filter(
                    models.StudyQuizQuestion.module_id == module.id
                ).count()

                total_lessons += module_total
                completed_lessons += module_completed

                if module_total > 0 and module_completed == module_total:
                    completed_modules += 1

                quiz = (
                    db.query(models.UserQuizAttempt)
                    .filter(
                        models.UserQuizAttempt.user_id == user.id,
                        models.UserQuizAttempt.module_id == module.id,
                    )
                    .order_by(models.UserQuizAttempt.attempted_at.desc())
                    .first()
                )

                mod_quiz = int(quiz.score / quiz.total * 100) if quiz and quiz.total > 0 else None
                if mod_quiz is not None:
                    quiz_scores.append(mod_quiz)

                mod_progress = int(module_completed / module_total * 100) if module_total > 0 else 0
                mod_status = (
                    "completed" if mod_progress == 100
                    else ("in-progress" if mod_progress > 0 else "not-started")
                )

                modules_data.append({
                    "moduleId": module.id,
                    "moduleTitle": module.title,
                    "completedLessons": module_completed,
                    "totalLessons": module_total,
                    "totalQuizQuestions": total_quiz_questions,
                    "progress": mod_progress,
                    "status": mod_status,
                    "quizScore": mod_quiz,
                })

            progress = int(completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
            total_progress_sum += progress
            status = (
                "completed" if progress == 100
                else ("in-progress" if progress > 0 else "not-started")
            )
            avg_quiz = int(sum(quiz_scores) / len(quiz_scores)) if quiz_scores else None

            courses_data.append({
                "courseId": course_id,
                "courseTitle": course_title,
                "completedModules": completed_modules,
                "totalModules": len(modules),
                "completedLessons": completed_lessons,
                "totalLessons": total_lessons,
                "progress": progress,
                "status": status,
                "quizScore": avg_quiz,
                "modules": modules_data,
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
            "courses": courses_data,
        })

    return result

@router.post("/repair-module-links")
def repair_module_links(db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    """
    One-time repair: link all StudyModules that have course_id=NULL to the
    course they logically belong to.  Works by scanning every Course and
    claiming all un-linked modules (course_id IS NULL).  Safe when there is
    only one course; when multiple courses exist it only links to a course
    that currently has NO linked modules (so it won't steal another course's
    modules).
    """
    courses = db.query(models.Course).all()
    total_fixed = 0
    report = []

    for course in courses:
        if course.modules:          # already has linked modules — skip
            continue
        orphaned = (
            db.query(models.StudyModule)
            .filter(models.StudyModule.course_id.is_(None))
            .all()
        )
        if not orphaned:
            continue
        for m in orphaned:
            m.course_id = course.id
        total_fixed += len(orphaned)
        report.append({"course": course.title, "modules_linked": len(orphaned)})

    db.commit()
    return {"total_fixed": total_fixed, "details": report}


@router.post("/assign-courses")
def assign_courses_to_users(
    payload: schemas.CourseAssignmentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    assigned_count = 0

    for module_id in payload.module_ids:
        module = db.query(models.StudyModule).filter(models.StudyModule.id == module_id).first()
        if not module:
            continue
        for uid in payload.user_ids:
            existing = db.query(models.UserCourseAssignment).filter(
                models.UserCourseAssignment.user_id == uid,
                models.UserCourseAssignment.module_id == module_id,
            ).first()
            if not existing:
                db.add(models.UserCourseAssignment(user_id=uid, module_id=module_id))
                assigned_count += 1

    db.commit()
    return {
        "message": f"Successfully assigned {assigned_count} new course records.",
        "assigned_count": assigned_count,
        "skipped_courses": [],
    }