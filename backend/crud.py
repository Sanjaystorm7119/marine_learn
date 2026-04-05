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