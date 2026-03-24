import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models
import json

db = SessionLocal()
materials = db.query(models.StudyMaterial).all()

print(f"Total materials: {len(materials)}")
for m in materials:
    print(f"ID: {m.id}, Title: {m.title}, Target Roles: {m.target_roles}, Type: {type(m.target_roles)}")

users = db.query(models.User).all()
print(f"Total users: {len(users)}")
for u in users:
    print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")

db.close()
