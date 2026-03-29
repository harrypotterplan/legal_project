from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
import datetime

Base = declarative_base()

# 1. 회원 테이블

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="USER", nullable=False) # ✨ 새로 추가된 권한 컬럼
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    refresh_token = Column(String, nullable=True)

    # 관계 설정
    search_logs = relationship("UserSearchLog", back_populates="user")

# 2. 유저 검색 기록 테이블 (DIR-01 대응)
class UserSearchLog(Base):
    __tablename__ = "user_search_logs"
    
    log_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    user_query = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=True)
    reliability_score = Column(Integer, nullable=True)
    used_tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # 관계 설정
    user = relationship("User", back_populates="search_logs")
    used_cases = relationship("UsedCaseMapping", back_populates="log")
    used_laws = relationship("UsedLawMapping", back_populates="log") # 법령 매핑 추가

# 3. 판례 데이터 테이블
class CaseLaw(Base):
    __tablename__ = "case_laws"
    
    case_id = Column(Integer, primary_key=True) # ChromaDB의 ID와 매핑됨
    case_name = Column(String, nullable=False)
    case_number = Column(String, nullable=False)
    case_type = Column(String, nullable=False)
    court_name = Column(String, nullable=False)
    judgment_date = Column(Date, nullable=False)
    category = Column(String, nullable=False)
    link = Column(String, nullable=True)

# 4. 근거 판례 매핑 테이블
class UsedCaseMapping(Base):
    __tablename__ = "used_case_mappings"
    
    mapping_id = Column(Integer, primary_key=True, autoincrement=True)
    log_id = Column(Integer, ForeignKey("user_search_logs.log_id"))
    case_id = Column(Integer, ForeignKey("case_laws.case_id"))

    log = relationship("UserSearchLog", back_populates="used_cases")

# ==========================================
#신규 추가 법령 데이터 보완
# ==========================================

# 5. 법령(조문) 데이터 테이블
class Law(Base):
    __tablename__ = "laws"
    
    law_id = Column(Integer, primary_key=True) # ChromaDB의 ID와 매핑됨
    law_name = Column(String, nullable=False) # 예: 민법, 근로기준법
    article_number = Column(String, nullable=False) # 예: 제390조
    article_content = Column(Text, nullable=False) # 조항 실제 내용
    category = Column(String, nullable=False) # 임대차/근로/소비자
    link = Column(String, nullable=True)

# 6. 근거 법령 매핑 테이블
class UsedLawMapping(Base):
    __tablename__ = "used_law_mappings"
    
    mapping_id = Column(Integer, primary_key=True, autoincrement=True)
    log_id = Column(Integer, ForeignKey("user_search_logs.log_id"))
    law_id = Column(Integer, ForeignKey("laws.law_id"))

    log = relationship("UserSearchLog", back_populates="used_laws")