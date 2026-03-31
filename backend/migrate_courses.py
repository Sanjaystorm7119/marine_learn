"""
Run once to create the courses table and add course_id FK column to study_modules.
Course data and module seeding is handled separately by seed_study.py.

    python migrate_courses.py
"""

from sqlalchemy import text
from database import engine
from models import Base

# Create all tables (courses, etc.) — safe to run multiple times
Base.metadata.create_all(bind=engine)
print("Tables created / verified.")

# Add course_id column to study_modules if it doesn't exist
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name='study_modules' AND column_name='course_id'
    """))
    if not result.fetchone():
        conn.execute(text(
            "ALTER TABLE study_modules ADD COLUMN course_id INTEGER REFERENCES courses(id)"
        ))
        conn.commit()
        print("Added course_id column to study_modules.")
    else:
        print("course_id column already exists.")

print("Migration complete.")
