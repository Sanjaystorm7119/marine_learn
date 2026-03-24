import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

db = SessionLocal()
materials = db.query(models.StudyMaterial).all()

with open("output.txt", "w", encoding="utf-8") as f:
    f.write(f"Total materials: {len(materials)}\n")
    for m in materials:
        f.write(f"ID: {m.id}, Title: {m.title}, Target Roles (repr): {repr(m.target_roles)}, Type: {type(m.target_roles)}\n")

    users = db.query(models.User).all()
    f.write(f"Total users: {len(users)}\n")
    for u in users:
        f.write(f"ID: {u.id}, Email: {u.email}, Role: {u.role}\n")

db.close()
