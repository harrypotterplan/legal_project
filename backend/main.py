# backend/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

import models
from database import engine
from routers import auth, users, legal, history


# 데이터베이스 초기화, SQLAlchemy ORM을 통한 데이터베이스 테이블 자동 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Legal AI API")

# 미들웨어 설정
# CORS (Cross-Origin Resource Sharing) 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite 기반 프론트엔드 로컬 개발 서버
        "http://localhost:3000",  # React 기본 포트 (Fallback)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용 (GET, POST, PUT, DELETE 등)
    allow_headers=["*"],  # 모든 HTTP 헤더 허용 (Authorization 등)
)

# 글로벌 예외 처리기 (Exception Handlers)
# Pydantic 데이터 유효성 검증 실패 (422 Unprocessable Entity) 처리
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # 기본적으로 배열 형태로 반환되는 상세 에러 구조에서 첫 번째 에러의 메시지만 추출
    error_msg = exc.errors()[0].get("msg", "입력 형식이 올바르지 않습니다.")
    
    # 프론트엔드 클라이언트가 처리하기 용이하도록 단일 메시지 형태의 JSON으로 포맷팅하여 응답
    return JSONResponse(
        status_code=422,
        content={"message": error_msg}
    )

# 루트 엔드포인트
@app.get("/")
def read_root():
    return {"message": "Legal AI Server is Running!"}


# 도메인별 API 라우터 등록
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(legal.router)
app.include_router(history.router)