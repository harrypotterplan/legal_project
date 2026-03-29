# backend/routers/legal.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas, models
from core.security import get_current_user
from database import get_db

router = APIRouter(prefix="/api/v1/legal", tags=["Legal"])

@router.post("/simulate", response_model=schemas.SimulationResponse)
def simulate_legal_case(
    request: schemas.SimulationRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # 1. 나중에 여기에 ChromaDB 검색 로직 추가
    # 2. 나중에 여기에 파인튜닝된 LLM 프롬프트 및 답변 생성 로직 추가
    
    # 임시(Mock) 데이터 생성
    dummy_answer = f"'{request.query}'에 대한 AI 시뮬레이션 결과입니다. 사기죄 성립 가능성이 있습니다."
    dummy_cases = ["대법원 2021도12345", "대법원 2020다6789"]
    
  # 3. 검색 기록 DB에 저장 (C)
    new_log = models.UserSearchLog(
        user_id=current_user.user_id,
        user_query=request.query,  # query -> user_query 로 변경
        ai_response=dummy_answer   # answer -> ai_response 로 변경
    )
    db.add(new_log)
    db.commit()
    
    # 4. 프론트엔드에 응답
    return {
        "answer": dummy_answer,
        "reliability_score": 88.5,
        "reference_cases": dummy_cases
    }