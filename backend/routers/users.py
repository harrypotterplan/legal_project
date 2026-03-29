# backend/routers/users.py
from fastapi import APIRouter, Depends
import schemas, models
from core.security import get_current_user

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user