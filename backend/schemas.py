from pydantic import BaseModel

# 1. 프론트엔드가 백엔드로 보낼 때의 데이터 규격 (회원가입 요청)
class UserCreate(BaseModel):
    email: str
    password: str

# 2. 백엔드가 프론트엔드에게 응답해 줄 데이터 규격 (비밀번호는 빼고 줌!)
class UserResponse(BaseModel):
    user_id: int
    email: str

    class Config:
        from_attributes = True # DB 모델을 Pydantic 모델로 부드럽게 변환해주는 마법의 옵션