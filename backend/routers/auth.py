# backend/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
import os
from jose import jwt, JWTError

import models, schemas
from database import get_db
from core.security import (
    get_password_hash, verify_password, create_access_token, ALGORITHM, SECRET_KEY
)

# Auth 라우터 설정
router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

# 환경변수 기반 토큰 만료 시간 설정 (기본값 제공)
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# ==========================================
# 회원가입 API (/signup)
# ==========================================
@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. 이메일 중복 검증
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 가입된 이메일입니다.")

    # 2. 비밀번호 해싱 및 유저 객체 생성
    hashed_pw = get_password_hash(user.password)
    new_user = models.User(email=user.email, password_hash=hashed_pw)
    
    # 3. DB 트랜잭션 처리
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # 생성된 PK(user_id) 등 최신 상태 반영
    
    return new_user


# ==========================================
# 로그인 API (/login) - JWT 발급
# ==========================================
@router.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. 유저 조회 및 비밀번호 검증
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Access Token 발급
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.user_id, "role": user.role},
        expires_delta=access_token_expires
    )

    # 3. Refresh Token 발급 및 DB 저장 (세션 탈취 대비)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_access_token(
        data={"sub": user.email, "type": "refresh"},
        expires_delta=refresh_token_expires
    )

    user.refresh_token = refresh_token
    db.commit()
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


# ==========================================
# 토큰 재발급 API (/refresh)
# ==========================================
@router.post("/refresh", response_model=schemas.Token)
def refresh_token(request: schemas.TokenRefreshRequest, db: Session = Depends(get_db)):
    # 공통 인증 에러 예외 객체
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh Token이 유효하지 않거나 만료되었습니다. 다시 로그인해주세요.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Refresh Token 디코딩 및 페이로드(Payload) 검증
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        # claim 유효성 검증 (토큰 타입 확인)
        if email is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        # 서명 검증 실패 또는 만료된 토큰
        raise credentials_exception

    # 2. DB에 저장된 Refresh Token 일치 여부 검증 (토큰 재사용 방지)
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None or user.refresh_token != request.refresh_token:
        raise credentials_exception

    # 3. 신규 Access Token 발급
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={"sub": user.email, "user_id": user.user_id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": new_access_token, "refresh_token": request.refresh_token, "token_type": "bearer"}