from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # ✨ CORS 문지기 불러오기
import models
from database import engine
from routers import auth, users, legal, history

# DB 테이블 세팅
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Legal AI API")

# ✨ 5173번 프론트엔드의 접근을 허락하는 문지기 세팅 (여기가 핵심입니다!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
        "http://127.0.0.1:5173"], # 허락할 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"], # GET, POST 등 모든 방식 허용
    allow_headers=["*"], # 모든 헤더 허용
)

@app.get("/")
def read_root():
    return {"message": "Legal AI Server is Running!"}

# 라우터 조립
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(legal.router)
app.include_router(history.router)