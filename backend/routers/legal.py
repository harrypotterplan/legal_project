# backend/routers/legal.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
import models
from core.security import get_current_user
from database import get_db

# AI/ML 팀이 만든 전체 파이프라인 함수
# 입력 검증, 질문 정규화, 판례 검색, 법령 검색, 신뢰도 계산, Gemini 답변 생성까지 내부에서 처리함
from ml.pipeline import run_pipeline


router = APIRouter(prefix="/api/v1/legal", tags=["Legal"])


# 법률 시뮬레이션 API
# 사용자가 입력한 법률 상황을 AI 파이프라인에 전달하고,
# 결과를 DB에 저장한 뒤 프론트엔드에 반환한다.
@router.post("/simulate", response_model=schemas.SimulationResponse)
def simulate_legal_case(
    request: schemas.SimulationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    법률 시뮬레이션 실행 흐름

    1. 프론트엔드에서 category, query를 받음
    2. run_pipeline()으로 AI/ML 전체 파이프라인 실행
    3. user_search_logs에 상담 결과 저장
    4. used_case_mappings에 사용 판례 근거 저장
    5. used_law_mappings에 사용 법령 근거 저장
    6. AI 분석 결과를 프론트엔드에 반환
    """

    # 1. AI/ML 파이프라인 실행
    try:
        result = run_pipeline(
            query=request.query,
            category=request.category
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI 파이프라인 오류: {str(e)}"
        )

    # 2. 파이프라인 결과에서 값 추출
    answer = result.get("answer", "응답 오류")
    summary = result.get("summary")
    reliability_score = result.get("reliability_score", 0)
    recommend_expert = result.get("recommend_expert", False)

    # 3. 상담 기록 저장
    # ai_response_en은 현재 사용하지 않으므로 저장하지 않음.
    # used_tokens도 현재 pipeline.py에서 반환하지 않으므로 None으로 저장됨.
    new_log = models.UserSearchLog(
        user_id=current_user.user_id,
        session_id=None,  # 세션 API 완전 연동 전까지는 None
        category=request.category,
        user_query=request.query,
        ai_response=answer,
        summary=summary,
        reliability_score=reliability_score,
        recommend_expert=recommend_expert,
        used_tokens=result.get("used_tokens")
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    # 4. 유사 판례 근거 저장
    # 현재는 case_laws.case_id FK를 쓰지 않음.
    # ChromaDB 검색 결과를 used_case_mappings에 그대로 저장하는 스냅샷 방식.
    #
    # 주의:
    # pipeline.py의 reference_cases 안에 있는 case_id는
    # 현재 DB 정수 ID가 아니라 "2009도5302" 같은 사건번호 역할을 함.
    # 따라서 case_id 값을 case_number로 저장함.
    for idx, case in enumerate(result.get("reference_cases", []), start=1):
        used_case = models.UsedCaseMapping(
            log_id=new_log.log_id,
            case_number=case.get("case_number") or case.get("case_id"),
            case_name=case.get("case_name"),
            court_name=case.get("court"),
            judgment_date=str(case.get("date")) if case.get("date") is not None else None,
            category=case.get("category"),
            similarity=case.get("similarity"),
            rank=idx
        )
        db.add(used_case)

    # 5. 관련 법령 근거 저장
    # 현재는 laws.law_id FK를 쓰지 않음.
    # ChromaDB_law 검색 결과를 used_law_mappings에 그대로 저장하는 스냅샷 방식.
    for idx, law in enumerate(result.get("reference_laws", []), start=1):
        law_name = law.get("law_name")
        article_number = law.get("article_number")

        used_law = models.UsedLawMapping(
            log_id=new_log.log_id,
            law_key=f"{law_name}_{article_number}" if law_name and article_number else None,
            law_name=law_name,
            article_number=article_number,
            category=law.get("category"),
            similarity=law.get("similarity"),
            rank=idx
        )
        db.add(used_law)

    # 6. 판례/법령 근거 저장 반영
    db.commit()

    # 7. 프론트엔드에 응답 반환
    return result