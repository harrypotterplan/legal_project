# backend/models.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Date,
    ForeignKey,
    Float,
    Boolean,
)
from sqlalchemy.orm import declarative_base, relationship
import datetime

Base = declarative_base()


# =========================================================
# 1. 회원 테이블
# 역할:
# - 회원가입/로그인 사용자 정보 저장
# - JWT 인증 시 현재 유저 확인에 사용
# =========================================================
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, default="사용자", nullable=False)
    password_hash = Column(String, nullable=False)
    
    # [원우 님 커스텀 필드 보존] 커스텀 권한 및 토큰
    role = Column(String, default="USER", nullable=False)
    refresh_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # 관계 설정
    search_logs = relationship("UserSearchLog", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")


# =========================================================
# 2. 채팅 세션 테이블
# 역할:
# - 하나의 상담방/대화방 단위 저장
# - 같은 주제로 이어지는 대화를 관리하기 위한 테이블
# =========================================================
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    session_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    category = Column(String, nullable=True)  # 임대차 / 근로 / 소비자
    title = Column(String, nullable=True)     # 대화방 제목

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    # 🚨 [안전 장치 추가] 세션이 삭제되면 내부 메시지도 함께 일괄 삭제되도록 cascade 적용
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    search_logs = relationship("UserSearchLog", back_populates="session")


# =========================================================
# 3. 채팅 메시지 테이블
# 역할:
# - 특정 세션 안에서 주고받은 실제 메시지 저장
# - role = "user" 또는 "assistant"
# =========================================================
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.session_id"), nullable=False)

    role = Column(String, nullable=False)  # user / assistant
    content = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # 관계 설정
    session = relationship("ChatSession", back_populates="messages")


# =========================================================
# 4. 유저 상담 기록 테이블
# 역할:
# - 사용자가 법률 시뮬레이션을 요청한 결과 저장
# - 마이페이지 상담 기록 목록/상세 조회에 사용
# =========================================================
class UserSearchLog(Base):
    __tablename__ = "user_search_logs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    session_id = Column(Integer, ForeignKey("chat_sessions.session_id"), nullable=True)
    
    category = Column(String, nullable=True)  # 임대차 / 근로 / 소비자
    user_query = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=True)
    
    # [원우 님 커스텀 필드 보존] 향후 영어 답변 확장용
    ai_response_en = Column(Text, nullable=True)
    
    summary = Column(Text, nullable=True)
    reliability_score = Column(Float, nullable=True)
    recommend_expert = Column(Boolean, nullable=True)
    used_tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # 🚨 [안전 장치 추가] 상담 기록 삭제 시 매핑된 판례/법령 스냅샷 찌꺼기도 함께 자동 삭제되도록 cascade 적용
    user = relationship("User", back_populates="search_logs")
    session = relationship("ChatSession", back_populates="search_logs")
    used_cases = relationship("UsedCaseMapping", back_populates="log", cascade="all, delete-orphan")
    used_laws = relationship("UsedLawMapping", back_populates="log", cascade="all, delete-orphan")


# =========================================================
# 5. 판례 원본 테이블 (현재 미사용 - 향후 확장 대비 보존)
# =========================================================
class CaseLaw(Base):
    __tablename__ = "case_laws"

    case_id = Column(Integer, primary_key=True, autoincrement=True)
    case_number = Column(String, nullable=True)
    case_name = Column(String, nullable=True)
    case_type = Column(String, nullable=True)
    court_name = Column(String, nullable=True)
    judgment_date = Column(Date, nullable=True)
    category = Column(String, nullable=True)
    link = Column(String, nullable=True)


# =========================================================
# 6. 사용 판례 근거 저장 테이블 (스냅샷 방식)
# 역할:
# - 특정 상담 기록에서 어떤 판례가 근거로 사용됐는지 스냅샷 저장
# =========================================================
class UsedCaseMapping(Base):
    __tablename__ = "used_case_mappings"

    mapping_id = Column(Integer, primary_key=True, autoincrement=True)
    log_id = Column(Integer, ForeignKey("user_search_logs.log_id"), nullable=False)

    case_number = Column(String, nullable=True)     # 예: 2009도5302
    case_name = Column(String, nullable=True)       # 예: 도로법위반
    court_name = Column(String, nullable=True)      # 예: 대법원
    judgment_date = Column(String, nullable=True)   # String 처리 유지
    category = Column(String, nullable=True)        
    similarity = Column(Float, nullable=True)       
    rank = Column(Integer, nullable=True)           

    log = relationship("UserSearchLog", back_populates="used_cases")


# =========================================================
# 7. 법령 원본 테이블 (현재 미사용 - 향후 확장 대비 보존)
# =========================================================
class Law(Base):
    __tablename__ = "laws"

    law_id = Column(Integer, primary_key=True, autoincrement=True)
    law_name = Column(String, nullable=True)        
    article_number = Column(String, nullable=True)  
    article_content = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    link = Column(String, nullable=True)


# =========================================================
# 8. 사용 법령 근거 저장 테이블 (스냅샷 방식)
# 역할:
# - 특정 상담 기록에서 어떤 법령이 근거로 사용됐는지 스냅샷 저장
# =========================================================
class UsedLawMapping(Base):
    __tablename__ = "used_law_mappings"

    mapping_id = Column(Integer, primary_key=True, autoincrement=True)
    log_id = Column(Integer, ForeignKey("user_search_logs.log_id"), nullable=False)

    law_key = Column(String, nullable=True)         # 예: 주택임대차보호법_제5조
    law_name = Column(String, nullable=True)        
    article_number = Column(String, nullable=True)  
    category = Column(String, nullable=True)
    similarity = Column(Float, nullable=True)
    rank = Column(Integer, nullable=True)

    log = relationship("UserSearchLog", back_populates="used_laws")