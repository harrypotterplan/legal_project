from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas, models

from core.security import get_current_user, verify_password, get_password_hash
from database import get_db

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

# 1. 마이페이지 통합 조회
@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# 2. 마이페이지 프로필 및 비밀번호 통합 수정
@router.put("/me", response_model=schemas.UserResponse)
def update_user_profile(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. 무조건 들어오는 '이름(username)'부터 업데이트
    current_user.username = payload.username
    
    # 2. 만약 프론트엔드에서 '현재 비번'과 '새 비번' 데이터를 보냈다면?
    if payload.current_password and payload.new_password:
        # 비번 맞는지 확인
        if not verify_password(payload.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="현재 비밀번호가 일치하지 않습니다."
            )
        # 맞으면 새 비번으로 덮어쓰기
        current_user.password_hash = get_password_hash(payload.new_password)

    # 3. DB에 최종 저장
    db.commit()
    db.refresh(current_user)
    
    return current_user