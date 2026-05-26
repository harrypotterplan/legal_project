# backend/routers/legal.py

import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
import models
from core.security import get_current_user
from database import get_db
from ml.pipeline import run_pipeline


router = APIRouter(prefix="/api/v1/legal", tags=["Legal"])

# 멀티턴 컨텍스트에서 제외할 메시지 (에러 메시지가 들어가면 다음 답변 망침)
ERROR_MARKERS = [
    "AI 분석 중 오류",
    "관련 판례와 법령을 찾을 수 없습니다",
    "관련 판례는 찾을 수 없지만",
    "10자 이상",
    "1000자 이하",
    "잘못된 입력",
]


@router.post("/simulate", response_model=schemas.SimulationResponse)
def simulate_legal_case(
    request: schemas.SimulationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    실행 흐름:
    1. session_id 검증 + category 자동 추출
    2. 이전 대화 가져와서 chat_history 만들기 (멀티턴 컨텍스트)
    3. AI 파이프라인 실행
    4. UserSearchLog 저장
    5. session 있으면 ChatMessage 두 개 자동 저장
    6. UsedCaseMapping / UsedLawMapping 저장
    """

    # 1. session_id 검증 + category 자동 추출
    session = None
    if request.session_id is not None:
        session = (
            db.query(models.ChatSession)
            .filter(
                models.ChatSession.session_id == request.session_id,
                models.ChatSession.user_id == current_user.user_id,
            )
            .first()
        )
        if not session:
            raise HTTPException(
                status_code=404,
                detail="해당 상담 세션을 찾을 수 없습니다."
            )
        # session 있으면 session의 category 자동 사용
        category = session.category
    else:
        # session 없으면 request의 category 사용 (schemas에서 필수 검증됨)
        category = request.category

    # 2. 이전 대화 가져오기 (멀티턴 컨텍스트)
    chat_history = []
    if session is not None:
        previous = (
            db.query(models.ChatMessage)
            .filter(models.ChatMessage.session_id == session.session_id)
            .order_by(models.ChatMessage.created_at.asc())
            .all()
        )
        for msg in previous:
            # 에러성 assistant 메시지는 history에서 제외
            if msg.role == "assistant" and any(marker in msg.content for marker in ERROR_MARKERS):
                continue
            # Gemini는 role을 "user" / "model"로 씀
            gemini_role = "user" if msg.role == "user" else "model"
            chat_history.append({
                "role": gemini_role,
                "parts": [msg.content]
            })
        # 토큰 한도 보호: 최근 10개만 유지
        chat_history = chat_history[-10:]

    # 3. AI/ML 파이프라인 실행
    try:
        result = run_pipeline(
            query=request.query,
            category=category,
            chat_history=chat_history,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI 파이프라인 오류: {str(e)}"
        )

    # 4. 결과 추출
    answer = result.get("answer", "응답 오류")
    summary = result.get("summary")
    reliability_score = result.get("reliability_score", 0)
    recommend_expert = result.get("recommend_expert", False)

    # 5. 상담 기록 저장
    new_log = models.UserSearchLog(
        user_id=current_user.user_id,
        session_id=request.session_id,
        category=category,
        user_query=request.query,
        ai_response=answer,
        summary=summary,
        reliability_score=reliability_score,
        recommend_expert=recommend_expert,
        used_tokens=result.get("used_tokens"),
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    # 6. 세션 메시지 자동 저장
    if session is not None:
        user_msg = models.ChatMessage(
            session_id=session.session_id,
            role="user",
            content=request.query,
        )
        assistant_msg = models.ChatMessage(
            session_id=session.session_id,
            role="assistant",
            content=answer,
        )
        db.add_all([user_msg, assistant_msg])
        session.updated_at = datetime.datetime.utcnow()

    # 7. 유사 판례 저장
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

    # 8. 관련 법령 저장
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

    db.commit()
    return result