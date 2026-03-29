from pydantic import BaseModel, EmailStr, field_validator
import re

# 1. 프론트엔드가 백엔드로 보낼 때의 데이터 규격 (회원가입 요청)
class UserCreate(BaseModel):
    email: EmailStr  # 일반 str에서 EmailStr로 변경하여 이메일 형식 자동 검증
    password: str

    # 비밀번호 복잡도 검사 (최소 8자, 영문/숫자/특수문자 포함)
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        pattern = r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
        if not re.match(pattern, v):
            raise ValueError('비밀번호는 8자 이상이며, 영문/숫자/특수문자를 포함해야 해.')
        return v

# 2. 백엔드가 프론트엔드에게 응답해 줄 데이터 규격
class UserResponse(BaseModel):
    user_id: int
    email: str

    class Config:
        from_attributes = True

# schemas.py 맨 아래에 추가해 줘

# 3. 로그인 요청 규격
class UserLogin(BaseModel):
    email: str
    password: str

# 4. 토큰 응답 규격
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

# 5. 토큰 재발급 요청 규격
class TokenRefreshRequest(BaseModel):
    refresh_token: str


# 법률 시뮬레이션 및 검색 기록 관련 규격
class SimulationRequest(BaseModel):
    category: str
    query: str

class SimulationResponse(BaseModel):
    answer: str
    reliability_score: float
    reference_cases: list[str]

class LogResponse(BaseModel):
    log_id: int
    user_query: str    # 여기 변경
    ai_response: str   # 여기 변경
    
    class Config:
        from_attributes = True