# backend/routers/history.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

import schemas
import models
from core.security import get_current_user
from database import get_db


router = APIRouter(prefix="/api/v1/history", tags=["History"])


# =========================================================
# 상담 기록 목록 조회 API
# 역할:
# - GET /api/v1/history/logs
# - 로그인한 사용자의 상담 기록 목록을 조회
# - 마이페이지 상담 기록 리스트에서 사용
#
# 반환:
# - log_id
# - category
# - user_query
# - ai_response
# - summary
# - reliability_score
# - recommend_expert
# - created_at
#
# 주의:
# - 목록에서는 used_cases / used_laws까지 굳이 안 내려줌
# - 판례/법령 근거는 상세 조회에서 반환
# =========================================================
@router.get("/logs", response_model=list[schemas.LogResponse])
def get_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logs = (
        db.query(models.UserSearchLog)
        .filter(models.UserSearchLog.user_id == current_user.user_id)
        .order_by(models.UserSearchLog.created_at.desc())
        .all()
    )

    return logs


# =========================================================
# 상담 기록 상세 조회 API
# 역할:
# - GET /api/v1/history/logs/{log_id}
# - 특정 상담 기록의 상세 내용 조회
# - 마이페이지에서 상담 기록 클릭 시 사용
#
# 반환:
# - 질문
# - AI 답변
# - 요약
# - 신뢰도
# - 전문가 상담 권고 여부
# - 이 답변에 사용된 판례 목록
# - 이 답변에 사용된 법령 목록
#
# 연동:
# - user_search_logs
# - used_case_mappings
# - used_law_mappings
# =========================================================
@router.get("/logs/{log_id}", response_model=schemas.LogDetailResponse)
def get_log_detail(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    log = (
        db.query(models.UserSearchLog)
        .options(
            selectinload(models.UserSearchLog.used_cases),
            selectinload(models.UserSearchLog.used_laws)
        )
        .filter(
            models.UserSearchLog.log_id == log_id,
            models.UserSearchLog.user_id == current_user.user_id
        )
        .first()
    )

    if not log:
        raise HTTPException(
            status_code=404,
            detail="해당 검색 기록을 찾을 수 없습니다."
        )

    # rank 기준으로 정렬
    # 이유:
    # - AI가 참고한 1순위, 2순위, 3순위 판례/법령 순서를 유지하기 위함
    used_cases = sorted(
        log.used_cases,
        key=lambda x: x.rank if x.rank is not None else 999
    )

    used_laws = sorted(
        log.used_laws,
        key=lambda x: x.rank if x.rank is not None else 999
    )

    # dict로 직접 반환
    # 이유:
    # - used_cases / used_laws를 정렬된 상태로 내려주기 위함
    return {
        "log_id": log.log_id,
        "category": log.category,
        "user_query": log.user_query,
        "ai_response": log.ai_response,
        "ai_response_en": log.ai_response_en,
        "summary": log.summary,
        "reliability_score": log.reliability_score,
        "recommend_expert": log.recommend_expert,
        "used_tokens": log.used_tokens,
        "created_at": log.created_at,
        "used_cases": used_cases,
        "used_laws": used_laws,
    }