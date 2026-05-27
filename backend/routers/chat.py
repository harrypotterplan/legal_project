# backend/routers/chat.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime

import models
import schemas
from database import get_db
from core.security import get_current_user


router = APIRouter(prefix="/api/v1/chat", tags=["Chat"])


# =========================================================
# 1. 새 상담 세션 생성
# 역할:
# - 사용자가 새 법률 상담을 시작할 때 상담방 생성
# =========================================================
@router.post("/sessions", response_model=schemas.ChatSessionResponse)
def create_chat_session(
    request: schemas.ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_session = models.ChatSession(
        user_id=current_user.user_id,
        category=request.category,
        title=request.title or f"{request.category} 상담"
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


# =========================================================
# 2. 내 상담 세션 목록 조회
# 역할:
# - 마이페이지 또는 사이드바에서 상담방 목록 표시
# =========================================================
@router.get("/sessions", response_model=list[schemas.ChatSessionResponse])
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    sessions = (
        db.query(models.ChatSession)
        .filter(models.ChatSession.user_id == current_user.user_id)
        .order_by(models.ChatSession.updated_at.desc())
        .all()
    )

    return sessions


# =========================================================
# 3. 특정 상담 세션의 메시지 조회
# 역할:
# - 마이페이지 갔다가 돌아왔을 때 채팅창 복원
# =========================================================
@router.get("/sessions/{session_id}/messages", response_model=list[schemas.ChatMessageResponse])
def get_chat_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    session = (
        db.query(models.ChatSession)
        .filter(
            models.ChatSession.session_id == session_id,
            models.ChatSession.user_id == current_user.user_id
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="해당 상담 세션을 찾을 수 없습니다.")

    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )

    return messages


# =========================================================
# 4. 특정 상담 세션에 메시지 저장
# 역할:
# - 특정 상담방에 사용자/AI 메시지를 저장
# - 현재는 메시지 저장만 담당
# - AI 답변 생성은 이후 legal.py 또는 별도 API와 연결
# =========================================================
@router.post("/sessions/{session_id}/messages", response_model=schemas.ChatMessageResponse)
def create_chat_message(
    session_id: int,
    request: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    session = (
        db.query(models.ChatSession)
        .filter(
            models.ChatSession.session_id == session_id,
            models.ChatSession.user_id == current_user.user_id
        )
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="해당 상담 세션을 찾을 수 없습니다.")

    new_message = models.ChatMessage(
        session_id=session_id,
        role=request.role,
        content=request.content
    )

    session.updated_at = datetime.datetime.utcnow()

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message