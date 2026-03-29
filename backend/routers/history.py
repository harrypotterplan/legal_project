# backend/routers/history.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models
from core.security import get_current_user
from database import get_db

router = APIRouter(prefix="/api/v1/history", tags=["History"])

# 목록 조회
@router.get("/logs")
def get_logs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logs = db.query(models.UserSearchLog).filter(models.UserSearchLog.user_id == current_user.user_id).all()
    return logs

# 상세 조회
@router.get("/logs/{log_id}")
def get_log_detail(log_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    log = db.query(models.UserSearchLog).filter(
        models.UserSearchLog.log_id == log_id, 
        models.UserSearchLog.user_id == current_user.user_id
    ).first()
    
    if not log:
        raise HTTPException(status_code=404, detail="해당 검색 기록을 찾을 수 없어.")
    return log