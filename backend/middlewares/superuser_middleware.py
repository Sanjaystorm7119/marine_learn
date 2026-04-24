from fastapi import Depends, HTTPException

import models
from middlewares.auth_middleware import get_current_user


def require_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if current_user.role != "super_user":
        raise HTTPException(
            status_code=403,
            detail="Access denied: super_user privileges required",
        )
    return current_user
