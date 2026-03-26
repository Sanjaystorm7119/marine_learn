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
