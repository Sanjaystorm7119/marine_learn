from sqlalchemy.orm import Session
from fastapi import HTTPException
import models
import schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def create_user(db: Session, user: schemas.UserCreate):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    db_user = models.User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role="crew",
        role_lead="Will be assigned by admin" # <-- ADDED THIS
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ... (keep your existing code above this) ...

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_roles(db: Session):
    return db.query(models.Role).all()

def create_role(db: Session, role: schemas.AdminRoleCreate):
    db_role = models.Role(
        name=role.name,
        description=role.description,
        lead=role.lead,
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def update_role(db: Session, role_id: int, role_update: schemas.AdminRoleUpdate):
    db_role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if db_role:
        db_role.name = role_update.name
        db_role.description = role_update.description
        db_role.lead = role_update.lead
        db.commit()
        db.refresh(db_role)
    return db_role

def delete_role(db: Session, role_id: int):
    db_role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if db_role:
        db.delete(db_role)
        db.commit()
    return db_role
def update_user_lead(db: Session, user_id: int, new_lead: str):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.role_lead = new_lead
        db.commit()
        db.refresh(db_user)
    return db_user


# ── Course Management ──────────────────────────────────────────────────────────

def build_admin_course_response(course: models.Course) -> dict:
    all_quiz = []
    for module in course.modules:
        all_quiz.extend(module.quiz_questions)

    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "icon": course.icon or "📘",
        "total_duration": course.total_duration or "",
        "order_num": course.order_num,
        "modules": [
            {
                "id": mod.id,
                "title": mod.title,
                "description": mod.description,
                "order_num": mod.order_num,
                "topics": [
                    {
                        "id": t.id,
                        "module_id": t.module_id,
                        "title": t.title,
                        "content": t.content,
                        "duration": t.duration or "15min",
                        "video_url": t.video_url or "",
                        "order_num": t.order_num,
                    }
                    for t in mod.topics
                ],
                "quiz_questions": [],
            }
            for mod in course.modules
        ],
        "quiz_questions": [
            {
                "id": q.id,
                "module_id": q.module_id,
                "question": q.question,
                "options": q.options,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
                "order_num": q.order_num,
            }
            for q in all_quiz
        ],
    }


def create_course_full(db: Session, payload: schemas.CourseInput) -> models.Course:
    course = models.Course(
        title=payload.title,
        description=payload.description,
        icon=payload.icon,
        total_duration=payload.total_duration,
        order_num=payload.order_num,
    )
    db.add(course)
    db.flush()

    first_module_id = None
    for i, mod_input in enumerate(payload.modules):
        module = models.StudyModule(
            course_id=course.id,
            title=mod_input.title,
            description=mod_input.description,
            order_num=i,
        )
        db.add(module)
        db.flush()

        if first_module_id is None:
            first_module_id = module.id

        for j, lesson in enumerate(mod_input.lessons):
            db.add(models.StudyTopic(
                module_id=module.id,
                title=lesson.title,
                content=lesson.content,
                duration=lesson.duration,
                video_url=lesson.video_url,
                order_num=j,
            ))

    if payload.quiz_questions and first_module_id:
        for k, q_input in enumerate(payload.quiz_questions):
            db.add(models.StudyQuizQuestion(
                module_id=first_module_id,
                question=q_input.question,
                options=q_input.options,
                correct_answer=q_input.correct_answer,
                explanation=q_input.explanation,
                order_num=k,
            ))

    db.commit()
    db.refresh(course)
    return course


def update_course_full(db: Session, course_id: int, payload: schemas.CourseInput) -> models.Course | None:
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        return None

    course.title = payload.title
    course.description = payload.description
    course.icon = payload.icon
    course.total_duration = payload.total_duration
    course.order_num = payload.order_num

    payload_module_ids = {m.id for m in payload.modules if m.id is not None}

    # Remove modules not in payload (cascade cleanup)
    for module in list(course.modules):
        if module.id not in payload_module_ids:
            db.query(models.UserCourseAssignment).filter(
                models.UserCourseAssignment.module_id == module.id
            ).delete()
            db.query(models.StudyQuizQuestion).filter(
                models.StudyQuizQuestion.module_id == module.id
            ).delete()
            for topic in list(module.topics):
                db.query(models.UserTopicProgress).filter(
                    models.UserTopicProgress.topic_id == topic.id
                ).delete()
            db.query(models.StudyTopic).filter(
                models.StudyTopic.module_id == module.id
            ).delete()
            db.delete(module)

    db.flush()

    first_module = None
    for i, mod_input in enumerate(payload.modules):
        if mod_input.id is not None:
            module = db.query(models.StudyModule).filter(
                models.StudyModule.id == mod_input.id
            ).first()
            module.title = mod_input.title
            module.description = mod_input.description
            module.order_num = i
        else:
            module = models.StudyModule(
                course_id=course_id,
                title=mod_input.title,
                description=mod_input.description,
                order_num=i,
            )
            db.add(module)
            db.flush()

        if first_module is None:
            first_module = module

        payload_topic_ids = {l.id for l in mod_input.lessons if l.id is not None}

        for topic in list(module.topics):
            if topic.id not in payload_topic_ids:
                db.query(models.UserTopicProgress).filter(
                    models.UserTopicProgress.topic_id == topic.id
                ).delete()
                db.delete(topic)

        db.flush()

        for j, lesson in enumerate(mod_input.lessons):
            if lesson.id is not None:
                topic = db.query(models.StudyTopic).filter(
                    models.StudyTopic.id == lesson.id
                ).first()
                topic.title = lesson.title
                topic.content = lesson.content
                topic.duration = lesson.duration
                topic.video_url = lesson.video_url
                topic.order_num = j
            else:
                db.add(models.StudyTopic(
                    module_id=module.id,
                    title=lesson.title,
                    content=lesson.content,
                    duration=lesson.duration,
                    video_url=lesson.video_url,
                    order_num=j,
                ))

    # Replace quiz questions on the first module only
    if first_module:
        db.query(models.StudyQuizQuestion).filter(
            models.StudyQuizQuestion.module_id == first_module.id
        ).delete()
        for k, q_input in enumerate(payload.quiz_questions):
            db.add(models.StudyQuizQuestion(
                module_id=first_module.id,
                question=q_input.question,
                options=q_input.options,
                correct_answer=q_input.correct_answer,
                explanation=q_input.explanation,
                order_num=k,
            ))

    db.commit()
    db.refresh(course)
    return course


def delete_course_full(db: Session, course_id: int) -> bool:
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        return False

    for module in list(course.modules):
        db.query(models.UserCourseAssignment).filter(
            models.UserCourseAssignment.module_id == module.id
        ).delete()
        db.query(models.StudyQuizQuestion).filter(
            models.StudyQuizQuestion.module_id == module.id
        ).delete()
        for topic in list(module.topics):
            db.query(models.UserTopicProgress).filter(
                models.UserTopicProgress.topic_id == topic.id
            ).delete()
        db.query(models.StudyTopic).filter(
            models.StudyTopic.module_id == module.id
        ).delete()

    db.query(models.StudyModule).filter(
        models.StudyModule.course_id == course_id
    ).delete()

    db.delete(course)
    db.commit()
    return True