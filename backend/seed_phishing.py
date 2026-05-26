"""
seed_phishing.py
────────────────
One-shot script to seed built-in phishing email templates into the database.

Run once after cloning or after a database reset:

    cd backend
    python seed_phishing.py
"""

import sys

from database import SessionLocal, engine
import models
from services.phishing_service import seed_builtin_templates, _BUILTIN_TEMPLATES

def main() -> None:
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(models.PhishingTemplate).filter_by(is_builtin=True).count()
        print(f"Existing built-in templates: {existing}")
        print(f"Templates to seed: {len(_BUILTIN_TEMPLATES)}")

        seed_builtin_templates(db)

        total = db.query(models.PhishingTemplate).filter_by(is_builtin=True).count()
        print(f"Done. Built-in templates in database: {total}")
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
