import re
import html
from datetime import datetime
from typing import Literal, List, Optional, Any

from pydantic import BaseModel, Field, EmailStr, field_validator


# =========================================================
# 1. 회원가입 요청 스키마
# 역할:
# - POST /api/v1/auth/signup 요청 body 검증
# - routers/auth.py의 signup()과 연동
# =========================================================
class UserCreate(BaseModel):
    email: EmailStr  # 이메일 형식 자동 검증
    username: str = Field(..., min_length=2, max_length=10)  # 사용자명 2~10자 제한
    password: str

    # 비밀번호 복잡도 검사
    # 영문/숫자/특수문자 포함, 8자 이상
    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        pattern = r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
        if not re.match(pattern, v):
            raise ValueError("비밀번호는 8자 이상이며, 영문/숫자/특수문자를 포함해야 해.")
        return v


# =========================================================
# 2. 상담 기록 목록 응답 스키마
# 역할:
# - GET /api/v1/history/logs 응답
# - GET /api/v1/users/me의 search_logs 응답과 연동
# - user_search_logs 테이블의 목록 표시용 필드
# =========================================================
class LogResponse(BaseModel):
    log_id: int
    category: Optional[str] = None  # 신규 추가: 임대차/근로/소비자 구분
    user_query: str
    ai_response: Optional[str] = None
    ai_response_en: Optional[str] = None  # 향후 영어 답변 확장용
    summary: Optional[str] = None  # 신규 추가: 마이페이지 목록용 요약
    reliability_score: Optional[float] = None  # Float 신뢰도 점수
    recommend_expert: Optional[bool] = None  # 신규 추가: 전문가 상담 권고 여부
    used_tokens: Optional[int] = None  # 현재는 미사용, 추후 토큰 사용량 저장용
    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# 3. 상담 기록 페이지네이션 응답 스키마
# 역할:
# - history 목록을 페이지 단위로 반환할 때 사용 가능
# - 현재 코드에서 안 쓰면 유지해도 문제 없음
# =========================================================
class LogListResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[LogResponse]


# =========================================================
# 4. 사용 판례 응답 스키마
# 역할:
# - GET /api/v1/history/logs/{log_id} 상세 응답에서 사용
# - models.UsedCaseMapping과 연동
# - 특정 답변에 어떤 판례가 사용됐는지 반환
# =========================================================
class UsedCaseResponse(BaseModel):
    mapping_id: int
    case_number: Optional[str] = None
    case_name: Optional[str] = None
    court_name: Optional[str] = None
    judgment_date: Optional[str] = None
    category: Optional[str] = None
    similarity: Optional[float] = None
    rank: Optional[int] = None

    class Config:
        from_attributes = True


# =========================================================
# 5. 사용 법령 응답 스키마
# 역할:
# - GET /api/v1/history/logs/{log_id} 상세 응답에서 사용
# - models.UsedLawMapping과 연동
# - 특정 답변에 어떤 법령이 사용됐는지 반환
# =========================================================
class UsedLawResponse(BaseModel):
    mapping_id: int
    law_key: Optional[str] = None
    law_name: Optional[str] = None
    article_number: Optional[str] = None
    category: Optional[str] = None
    similarity: Optional[float] = None
    rank: Optional[int] = None

    class Config:
        from_attributes = True


# =========================================================
# 6. 상담 기록 상세 응답 스키마
# 역할:
# - GET /api/v1/history/logs/{log_id} 응답
# - user_search_logs + used_case_mappings + used_law_mappings 통합 반환
# =========================================================
class LogDetailResponse(BaseModel):
    log_id: int
    category: Optional[str] = None
    user_query: str
    ai_response: Optional[str] = None
    ai_response_en: Optional[str] = None
    summary: Optional[str] = None
    reliability_score: Optional[float] = None
    recommend_expert: Optional[bool] = None
    used_tokens: Optional[int] = None
    created_at: datetime

    used_cases: List[UsedCaseResponse] = Field(default_factory=list)
    used_laws: List[UsedLawResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


# =========================================================
# 7. 회원 정보 수정 요청 스키마
# 역할:
# - PUT /api/v1/users/me 요청 body 검증
# - routers/users.py의 update_user_profile()과 연동
# =========================================================
class UserUpdate(BaseModel):
    username: str = Field(..., min_length=2, max_length=10)

    # 비밀번호 변경 안 할 경우 None 허용
    current_password: Optional[str] = None
    new_password: Optional[str] = None


# =========================================================
# 8. 회원 정보 응답 스키마
# 역할:
# - POST /api/v1/auth/signup 응답
# - GET /api/v1/users/me 응답
# - models.User와 연동
# =========================================================
class UserResponse(BaseModel):
    user_id: int
    email: str
    username: str
    search_logs: List[LogResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


# =========================================================
# 9. 로그인 요청 스키마
# 역할:
# - POST /api/v1/auth/login 요청 body 검증
# =========================================================
class UserLogin(BaseModel):
    email: str
    password: str


# =========================================================
# 10. 토큰 응답 스키마
# 역할:
# - POST /api/v1/auth/login 응답
# - POST /api/v1/auth/refresh 응답
# =========================================================
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# =========================================================
# 11. 토큰 재발급 요청 스키마
# 역할:
# - POST /api/v1/auth/refresh 요청 body 검증
# =========================================================
class TokenRefreshRequest(BaseModel):
    refresh_token: str


# =========================================================
# 12. 채팅 세션 생성 요청 스키마
# 역할:
# - POST /api/v1/chat/sessions 요청 body 검증
# - 새 상담방 생성 시 category, title을 받음
# =========================================================
class ChatSessionCreate(BaseModel):
    category: Literal["임대차", "근로", "소비자"]
    title: Optional[str] = None


# =========================================================
# 13. 채팅 세션 응답 스키마
# 역할:
# - GET /api/v1/chat/sessions 응답
# - POST /api/v1/chat/sessions 응답
# - models.ChatSession과 연동
# =========================================================
class ChatSessionResponse(BaseModel):
    session_id: int
    category: Optional[str] = None
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# 14. 채팅 메시지 생성 요청 스키마
# 역할:
# - POST /api/v1/chat/sessions/{session_id}/messages 요청 body 검증
# - 특정 상담방에 user/assistant 메시지 저장
# =========================================================
class ChatMessageCreate(BaseModel):
    role: Literal["user", "assistant"] = "user"
    content: str = Field(..., min_length=1, max_length=3000)

    @field_validator("content")
    @classmethod
    def sanitize_content(cls, v: str):
        return html.escape(v)


# =========================================================
# 15. 채팅 메시지 응답 스키마
# 역할:
# - GET /api/v1/chat/sessions/{session_id}/messages 응답
# - POST /api/v1/chat/sessions/{session_id}/messages 응답
# - models.ChatMessage와 연동
# =========================================================
class ChatMessageResponse(BaseModel):
    message_id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# 16. 법률 시뮬레이션 요청 스키마
# 역할:
# - POST /api/v1/legal/simulate 요청 body 검증
# - routers/legal.py의 simulate_legal_case()와 연동
#
# 현재 구조:
# - 세션형 대화는 /chat/sessions API로 분리
# - 따라서 여기에는 session_id를 넣지 않음
# =========================================================
class SimulationRequest(BaseModel):
    # 카테고리 검증: 이 3개 외 값이면 422 에러
    category: Literal["임대차", "근로", "소비자"]

    # 사용자 질문 길이 검증
    query: str = Field(
        ...,
        min_length=10,
        max_length=1000,
        description="피해 상황을 10자 이상 1000자 이내로 입력해."
    )

    # XSS 방어: <script> 같은 태그를 안전한 문자로 변환
    @field_validator("query")
    @classmethod
    def sanitize_query(cls, v: str):
        return html.escape(v)


# =========================================================
# 17. 참고 판례 응답 스키마
# 역할:
# - pipeline.py의 reference_cases 응답 구조와 연동
# - ChromaDB 판례 검색 결과를 프론트에 반환
# - legal.py에서 used_case_mappings 저장에도 사용
# =========================================================
class ReferenceCase(BaseModel):
    case_name: Optional[str] = None

    # 현재 pipeline.py에서는 case_id에 사건번호가 들어올 수 있음
    # 예: "2009도5302"
    case_id: Optional[str] = None

    # 추후 pipeline.py에서 case_number로 명칭 정리할 경우 대비
    case_number: Optional[str] = None

    category: Optional[str] = None
    court: Optional[str] = None
    date: Optional[Any] = None
    similarity: Optional[float] = None


# =========================================================
# 18. 참고 법령 응답 스키마
# 역할:
# - pipeline.py의 reference_laws 응답 구조와 연동
# - ChromaDB_law 법령 검색 결과를 프론트에 반환
# - legal.py에서 used_law_mappings 저장에도 사용
# =========================================================
class ReferenceLaw(BaseModel):
    law_name: Optional[str] = None

    # 현재는 빈 문자열이 들어올 수 있어 Any 허용
    law_id: Optional[Any] = None

    article_number: Optional[str] = None
    category: Optional[str] = None
    similarity: Optional[float] = None


# =========================================================
# 19. 법률 시뮬레이션 응답 스키마
# 역할:
# - POST /api/v1/legal/simulate 응답
# - pipeline.py의 run_pipeline() 반환값과 연동
#
# 기존 구조:
# - answer_kr
# - answer_en
#
# 변경 구조:
# - answer
# - summary
# - reliability_score
# - recommend_expert
# - reference_cases
# - reference_laws
# =========================================================
class SimulationResponse(BaseModel):
    answer: str
    summary: Optional[str] = None
    reliability_score: float
    recommend_expert: bool
    reference_cases: List[ReferenceCase] = Field(default_factory=list)
    reference_laws: List[ReferenceLaw] = Field(default_factory=list)