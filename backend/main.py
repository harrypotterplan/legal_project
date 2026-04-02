from fastapi import FastAPI
import models
from database import engine
from routers import auth, users, legal, history

# DB 테이블 세팅
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Legal AI API")

@app.get("/")
def read_root():
    return {"message": "Legal AI Server is Running!"}

# 라우터 조립
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(legal.router)
app.include_router(history.router)