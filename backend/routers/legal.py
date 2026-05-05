# backend/routers/legal.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models
from core.security import get_current_user
from database import get_db

# ml 폴더에서 AI 팀이 만든 핵심 함수들 싹 다 가져오기
from ml.pipeline import validate_input, search_cases, calc_reliability, call_gemini

router = APIRouter(prefix="/api/v1/legal", tags=["Legal"])

# ⭐️ 추가/수정: 리턴값이 한/영 2개로 늘어나서 기존 스키마(SimulationResponse)랑 충돌할 수 있으므로 임시로 response_model 제거
@router.post("/simulate") 
def simulate_legal_case(
    request: schemas.SimulationRequest, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # 입력 검증 (AI팀 함수 재활용)
    valid, msg = validate_input(request.query)
    if not valid:
        # 입력값이 이상하면 400 에러 뱉기
        raise HTTPException(status_code=400, detail=msg)

    # 1. 나중에 여기에 ChromaDB 검색 로직 추가 -> (완료: AI팀 search_cases 함수 연결)
    cases = search_cases(request.query)
    
    # 판례가 안 나오면 에러 처리
    if not cases:
        raise HTTPException(status_code=404, detail="관련 판례를 찾을 수 없습니다.")

    #  신뢰도 계산 (카테고리 정보가 request에 없다면 임시로 '일반' 세팅)
    category = getattr(request, 'category', '일반')
    reliability = calc_reliability(cases, category)

    # 2. 나중에 여기에 파인튜닝된 LLM 프롬프트 및 답변 생성 로직 추가 -> (완료: Gemini 호출)
    try:
        # ⭐️ 수정: call_gemini는 이제 단순 텍스트가 아니라 딕셔너리({"kr": "...", "en": "..."})를 반환함!
        ai_answer_dict, _ = call_gemini(request.query, cases)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 서버 통신 오류: {str(e)}")
    
    # 프론트엔드에 던져줄 판례 이름만 리스트로 뽑아내기
    ref_cases = [c['case_name'] for c in cases]
    
    # 임시(Mock) 데이터 생성 이제 안 쓰니까 주석 처리
    # dummy_answer = f"'{request.query}'에 대한 AI 시뮬레이션 결과입니다. 사기죄 성립 가능성이 있습니다."
    # dummy_cases = ["대법원 2021도12345", "대법원 2020다6789"]
    
    # 3. 검색 기록 DB에 저장 (C)
    new_log = models.UserSearchLog(
        user_id=current_user.user_id,
        user_query=request.query,  # query -> user_query 로 변경
        # DB 컬럼에는 딕셔너리를 못 넣으니까, 메인 언어인 한국어 답변만 대표로 뽑아서 저장
        ai_response=ai_answer_dict.get("kr", "응답 오류") 
    )
    db.add(new_log)
    db.commit()
    
    # 4. 프론트엔드에 응답
    return {
        # 프론트엔드에서 스위치 버튼으로 편하게 렌더링할 수 있게 한국어/영어 분리해서 쏴줌
        "answer_kr": ai_answer_dict.get("kr", "한국어 응답 오류"), 
        "answer_en": ai_answer_dict.get("en", "English error"),  
        "reliability_score": reliability,  # AI팀 로직으로 계산된 신뢰도
        "reference_cases": ref_cases       # 실제 검색된 판례 이름들
    }