# backend/routers/history.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
import schemas, models
from core.security import get_current_user
from database import get_db

router = APIRouter(prefix="/api/v1/history", tags=["History"])

# 1. 마이페이지 상담 기록 목록 조회
@router.get("/logs", response_model=list[schemas.LogResponse])
def get_logs(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # 최신 상담 기록이 위로 올라오도록 내림차순(desc) 정렬하여 반환
    logs = (
        db.query(models.UserSearchLog)
        .filter(models.UserSearchLog.user_id == current_user.user_id)
        .order_by(models.UserSearchLog.created_at.desc())
        .all()
    )
    return logs


# 2. 마이페이지 특정 상담 기록 상세 조회 (판례/법령 스냅샷 포함)
@router.get("/logs/{log_id}", response_model=schemas.LogDetailResponse)
def get_log_detail(
    log_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # selectinload를 사용하여 연관된 판례/법령 데이터를 한 번의 쿼리로 효율적으로 로드 (N+1 문제 방지)
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

    # AI가 참고한 중요도 순위(rank)를 기준으로 안전하게 오름차순 정렬
    used_cases = sorted(
        log.used_cases, 
        key=lambda x: x.rank if x.rank is not None else 999
    )

    used_laws = sorted(
        log.used_laws, 
        key=lambda x: x.rank if x.rank is not None else 999
    )

    # schemas.LogDetailResponse 규격에 맞춰 딕셔너리로 조립하여 프론트엔드로 반환
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


# 3. 마이페이지 특정 상담 기록 삭제
@router.delete("/logs/{log_id}")
def delete_history_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    log = db.query(models.UserSearchLog).filter(
        models.UserSearchLog.log_id == log_id,
        models.UserSearchLog.user_id == current_user.user_id
    ).first()

    if not log:
        raise HTTPException(status_code=404, detail="해당 기록을 찾을 수 없습니다.")

    # cascade="all, delete-orphan" 설정 덕분에 매핑된 스냅샷(판례, 법령)들도 자동 삭제됨
    db.delete(log)
    db.commit()
    
    return {"message": "기록이 성공적으로 삭제되었습니다."}