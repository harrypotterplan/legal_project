import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  # models.py에서 Base 가져오기

# .env 파일 불러오기
load_dotenv()

# 1. 이렇게 os.getenv를 써야 .env 안에 있는 주소를 읽어옴! 
# (.env가 없으면 기본값으로 sqlite:///./legal.db를 씀)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./legal.db")

# 2. DB 엔진 생성
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. DB 접속 세션 만들기
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. 설계도를 바탕으로 실제 DB 파일과 테이블 생성하기
Base.metadata.create_all(bind=engine)

# 5. DB 연결 세션을 가져오는 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()