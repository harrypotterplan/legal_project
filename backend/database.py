from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base # 방금 만든 설계도(models.py)를 불러옴

# 1. SQLite DB 파일 주소 설정 (backend 폴더 안에 legal.db가 생길 예정)
SQLALCHEMY_DATABASE_URL = "sqlite:///./legal.db"

# 2. DB 엔진 생성 (공장장 역할)
# check_same_thread=False는 FastAPI + SQLite 조합에서 필수로 넣어야 하는 옵션이야.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. DB 접속 세션 만들기 (데이터를 넣고 뺄 때 쓰는 통로)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. [핵심!] 설계도를 바탕으로 실제 DB 파일과 테이블 생성하기
# 이 코드가 실행되는 순간, legal.db 파일이 없으면 새로 만들고 테이블을 쫙 깔아줘.
Base.metadata.create_all(bind=engine)

# 5. DB 연결 세션을 가져오는 함수 (나중에 API 만들 때 쓸 거야)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()