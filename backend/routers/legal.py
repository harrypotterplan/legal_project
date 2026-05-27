# backend/routers/legal.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
import models
from core.security import get_current_user
from database import get_db
from ml.pipeline import run_pipeline

router = APIRouter(prefix="/api/v1/legal", tags=["Legal"])

@router.post("/simulate", response_model=schemas.SimulationResponse)
def simulate_legal_case(
    request: schemas.SimulationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
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

    # 2. DB 에러 방어 핵심 로직
    raw_answer = result.get("answer", "응답 없음")
    if isinstance(raw_answer, dict):
        ai_answer = raw_answer.get("kr", raw_answer.get("en", str(raw_answer)))
    else:
        ai_answer = str(raw_answer)

    # 3. 파이프라인 결과에서 나머지 값 추출
    summary = result.get("summary", ai_answer[:100] + "...")
    reliability_score = result.get("reliability_score", 0.0)
    recommend_expert = result.get("recommend_expert", False)
    ref_cases = result.get("reference_cases", [])
    ref_laws = result.get("reference_laws", [])

    # 4. 에러 처리 (검색 실패 및 입력 조건 등)
    if reliability_score == 0 and not ref_cases:
        if "이상" in ai_answer or "이하" in ai_answer or "잘못된" in ai_answer:
            raise HTTPException(status_code=400, detail=ai_answer)
        else:
            raise HTTPException(status_code=404, detail=ai_answer)

    # 5. 상담 기록 본체 저장
    new_log = models.UserSearchLog(
        user_id=current_user.user_id,
        session_id=None,  # 세션 API 완전 연동 전까지는 None
        category=request.category,
        user_query=request.query,
        ai_response=ai_answer,     
        ai_response_en=ai_answer,  
        summary=summary,
        reliability_score=reliability_score,
        recommend_expert=recommend_expert,
        used_tokens=result.get("used_tokens")
    )

    db.add(new_log)
    db.flush() # 스냅샷 매핑(log_id)을 위해 임시 저장

    # 6. 유사 판례 근거 스냅샷 저장
    for idx, case in enumerate(ref_cases, start=1):
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

    # 7. 관련 법령 근거 스냅샷 저장
    for idx, law in enumerate(ref_laws, start=1):
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

    # 8. 판례/법령 근거 최종 커밋
    db.commit()
    db.refresh(new_log)

    # 9. 디버깅용 로그 출력
    print(f"=====================================")
    print(f"검색된 판례 개수: {len(ref_cases)} 개")
    print(f"검색된 법령 개수: {len(ref_laws)} 개")
    print(f"=====================================")

    # 🚨 10. [핵심 에러 해결] 스키마(SimulationResponse)에 완벽하게 일치하는 응답 포맷
    return {
        "answer": ai_answer,
        "summary": summary,
        "reliability_score": reliability_score,
        "recommend_expert": recommend_expert,
        "reference_cases": ref_cases,
        "reference_laws": ref_laws
    }