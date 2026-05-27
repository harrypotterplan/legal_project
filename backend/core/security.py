import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import models
from database import get_db

# 1. 환경변수 불러오기
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "여기에_임시_비밀키_입력") # 깡통키 방어막 적용
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# 2. 암호화 및 문지기 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# "토큰 없는 놈들은 /api/v1/auth/login 가서 받아와라!" 라고 안내하는 문지기
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ==========================================
# 기능: 비밀번호 암호화 및 검증
# ==========================================
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# ==========================================
# 기능: JWT 토큰 발급
# ==========================================
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ==========================================
# 기능: 미드웨어 문지기 (다른 API에서 유저 신원 확인할 때 필수 사용)
# ==========================================
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="토큰이 유효하지 않거나 만료됨.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. 토큰 위조 검사
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # 2. 위조 통과했으면 DB에 진짜 있는 유저인지 한 번 더 확인
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
        
    # 3. 통과 후 유저 정보를 API에 넘겨줌
    return user