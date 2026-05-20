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
    role = Column(String, default="USER", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    refresh_token = Column(String, nullable=True)

    # 관계 설정
    search_logs = relationship("UserSearchLog", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")


# =========================================================
# 2. 채팅 세션 테이블
# 역할:
# - 하나의 상담방/대화방 단위 저장
# - 같은 주제로 이어지는 대화를 관리하기 위한 테이블
#
# 예:
# session_id = 1
# title = "월세 미납 세입자 문제"
# category = "임대차"
# =========================================================
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    session_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    category = Column(String, nullable=True)  # 임대차 / 근로 / 소비자
    title = Column(String, nullable=True)     # 대화방 제목

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    # 관계 설정
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session")
    search_logs = relationship("UserSearchLog", back_populates="session")


# =========================================================
# 3. 채팅 메시지 테이블
# 역할:
# - 특정 세션 안에서 주고받은 실제 메시지 저장
# - role = "user" 또는 "assistant"
#
# 예:
# user: 월세를 안 내는 세입자를 내보내고 싶어요
# assistant: 판례에 따르면...
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
#
# 이번 수정 포인트:
# - category 추가
# - summary 추가
# - recommend_expert 추가
# - reliability_score Integer → Float 변경
# - ai_response_en은 향후 영어 답변 확장용으로 유지
# - session_id 추가: 어느 상담방에서 나온 결과인지 연결
# =========================================================
class UserSearchLog(Base):
    __tablename__ = "user_search_logs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    # 세션형 대화와 연결하기 위한 컬럼
    # 아직 세션 기능을 완전히 안 붙여도 nullable=True라 문제 없음
    session_id = Column(Integer, ForeignKey("chat_sessions.session_id"), nullable=True)

    # 사용자가 선택한 법률 분야
    category = Column(String, nullable=True)  # 임대차 / 근로 / 소비자

    # 사용자 질문
    user_query = Column(Text, nullable=False)

    # AI 한국어 답변
    ai_response = Column(Text, nullable=True)

    # 현재는 사용하지 않지만, 향후 영어 답변 재도입 가능성을 위해 유지
    ai_response_en = Column(Text, nullable=True)

    # AI 요약본
    # 마이페이지 목록에서 답변 전문 대신 요약 표시용
    summary = Column(Text, nullable=True)

    # 신뢰도 점수
    # pipeline.py가 24.2, 58.1처럼 소수점으로 반환하므로 Float 사용
    reliability_score = Column(Float, nullable=True)

    # 신뢰도 낮을 때 전문가 상담 권고 여부
    recommend_expert = Column(Boolean, nullable=True)

    # 현재 Gemini 응답에서는 토큰 사용량을 저장하지 않음
    # 나중에 OpenAI/토큰 사용량 추적 시 사용 가능
    used_tokens = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # 관계 설정
    user = relationship("User", back_populates="search_logs")
    session = relationship("ChatSession", back_populates="search_logs")
    used_cases = relationship("UsedCaseMapping", back_populates="log")
    used_laws = relationship("UsedLawMapping", back_populates="log")


# =========================================================
# 5. 판례 원본 테이블
# 역할:
# - 원래는 판례 원본 메타데이터 저장용
# - case_id는 DB 내부에서 판례 하나를 구분하는 정수 ID
# - case_number는 실제 사건번호. 예: 2009도5302
#
# 현재 상태:
# - 실제 검색은 SQLite case_laws가 아니라 ChromaDB에서 수행 중
# - 이번 주 기능 구현에서는 직접 사용하지 않음
# - 다음 주에 seed 데이터 넣고 ChromaDB metadata와 맞추면 FK 방식으로 활용 가능
# =========================================================
class CaseLaw(Base):
    __tablename__ = "case_laws"

    # 현재는 직접 사용하지 않지만, 추후 원본 판례 DB 연동용으로 유지
    case_id = Column(Integer, primary_key=True, autoincrement=True)

    # 실제 사건번호
    case_number = Column(String, nullable=True)

    case_name = Column(String, nullable=True)
    case_type = Column(String, nullable=True)
    court_name = Column(String, nullable=True)
    judgment_date = Column(Date, nullable=True)
    category = Column(String, nullable=True)
    link = Column(String, nullable=True)


# =========================================================
# 6. 사용 판례 근거 저장 테이블
# 역할:
# - 특정 상담 기록에서 어떤 판례가 근거로 사용됐는지 저장
#
# 이번 수정 방향:
# - 기존 case_id FK 방식은 일단 사용하지 않음
# - 현재 ChromaDB 검색 결과를 그대로 저장하는 스냅샷 방식 사용
#
# 스냅샷 방식이란:
# - case_laws 테이블에서 다시 찾지 않고
# - ChromaDB에서 반환된 사건번호, 사건명, 법원명, 유사도 등을 그대로 저장
# =========================================================
class UsedCaseMapping(Base):
    __tablename__ = "used_case_mappings"

    mapping_id = Column(Integer, primary_key=True, autoincrement=True)
    log_id = Column(Integer, ForeignKey("user_search_logs.log_id"), nullable=False)

    # 현재는 case_laws.case_id FK를 쓰지 않고 검색 결과를 직접 저장
    # ChromaDB 결과의 case_id는 실제로 사건번호 역할을 하므로 case_number로 저장
    case_number = Column(String, nullable=True)     # 예: 2009도5302
    case_name = Column(String, nullable=True)       # 예: 도로법위반
    court_name = Column(String, nullable=True)      # 예: 대법원
    judgment_date = Column(String, nullable=True)   # ChromaDB에서 20090924.0처럼 올 수 있어 String 처리
    category = Column(String, nullable=True)        # 임대차 / 근로 / 소비자
    similarity = Column(Float, nullable=True)       # 검색 유사도
    rank = Column(Integer, nullable=True)           # 검색 결과 순위. 1위, 2위, 3위

    log = relationship("UserSearchLog", back_populates="used_cases")


# =========================================================
# 7. 법령 원본 테이블
# 역할:
# - 법령 조문 원본 저장용
# - law_id는 DB 내부에서 조문 하나를 구분하는 정수 ID
#
# 현재 상태:
# - 실제 법령 검색은 SQLite laws가 아니라 ChromaDB_law에서 수행 중
# - seed 데이터 넣고 ChromaDB metadata와 맞추면 FK 방식으로 활용 가능
# =========================================================
class Law(Base):
    __tablename__ = "laws"

    # 현재는 직접 사용하지 않지만, 추후 원본 법령 DB 연동용으로 유지
    law_id = Column(Integer, primary_key=True, autoincrement=True)

    law_name = Column(String, nullable=True)        # 예: 주택임대차보호법, 민법
    article_number = Column(String, nullable=True)  # 예: 제5조, 제390조
    article_content = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    link = Column(String, nullable=True)


# =========================================================
# 8. 사용 법령 근거 저장 테이블
# 역할:
# - 특정 상담 기록에서 어떤 법령이 근거로 사용됐는지 저장
#
# 이번 수정 방향:
# - 기존 law_id FK 방식은 일단 사용하지 않음
# - 현재 ChromaDB_law 검색 결과를 그대로 저장하는 스냅샷 방식 사용
# =========================================================
class UsedLawMapping(Base):
    __tablename__ = "used_law_mappings"

    mapping_id = Column(Integer, primary_key=True, autoincrement=True)
    log_id = Column(Integer, ForeignKey("user_search_logs.log_id"), nullable=False)

    # 현재는 laws.law_id FK를 쓰지 않고 검색 결과를 직접 저장
    law_key = Column(String, nullable=True)         # 예: 주택임대차보호법_제5조
    law_name = Column(String, nullable=True)        # 예: 주택임대차보호법
    article_number = Column(String, nullable=True)  # 예: 제5조
    category = Column(String, nullable=True)
    similarity = Column(Float, nullable=True)
    rank = Column(Integer, nullable=True)

    log = relationship("UserSearchLog", back_populates="used_laws")