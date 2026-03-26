"""
admin_middleware.py
───────────────────
Provides `require_admin` — a FastAPI dependency that builds on
`get_current_user` and additionally enforces that the caller's role
is "admin".

Usage:
    @router.get("/admin/something")
    def some_admin_route(admin: models.User = Depends(require_admin)):
        ...
"""

from fastapi import Depends, HTTPException

import models
from middlewares.auth_middleware import get_current_user


def require_admin(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """Allow only users whose role is 'admin', raise 403 otherwise."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied: admin privileges required",
        )
    return current_user
