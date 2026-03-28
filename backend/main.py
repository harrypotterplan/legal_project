from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

import models
import schemas
from database import engine, get_db

# 서버 켤 때 DB 테이블 한 번 더 확실하게 체크 (없으면 만듦)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 🔒 비밀번호 암호화(Bcrypt) 설정 엔진
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password) # 평문 비밀번호를 복호화 불가능한 해시값으로 변환

@app.get("/")
def read_root():
    return {"message": "Legal AI Server is Running!"}

# ✨ 대망의 회원가입 API
@app.post("/api/v1/auth/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    
    # 1. 이미 가입된 이메일인지 DB에서 검색
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        # 중복이면 400 에러를 뱉어냄
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")

    # 2. 비밀번호 암호화 진행 (ppt에 적은 Bcrypt 적용!)
    hashed_pw = get_password_hash(user.password)

    # 3. 새로운 유저 정보 DB에 넣기 준비
    new_user = models.User(email=user.email, password_hash=hashed_pw)
    db.add(new_user)  # 장바구니에 담기
    db.commit()       # 진짜 DB에 저장 (도장 쾅!)
    db.refresh(new_user) # 저장된 데이터를 다시 불러와서 최신 상태로 만듦 (user_id 등을 받기 위해)

    # 4. 프론트엔드에게 가입된 유저 정보 반환 (password는 schemas.py 설정 때문에 자동으로 걸러짐)
    return new_user