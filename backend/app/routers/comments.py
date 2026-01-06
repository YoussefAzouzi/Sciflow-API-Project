from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..db import get_db
from ..models import Comment, Conference, User
from ..schemas import CommentCreate, CommentRead
from ..auth import get_current_user

router = APIRouter(prefix="/conferences/{conference_id}/comments", tags=["comments"])


@router.post("", response_model=CommentRead, status_code=201)
async def create_comment(
    conference_id: int,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check conference exists
    conf_result = await db.execute(select(Conference).where(Conference.id == conference_id))
    if not conf_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Conference not found")

    comment = Comment(
        user_id=current_user.id,
        conference_id=conference_id,
        content=payload.content,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    return CommentRead(
        id=comment.id,
        user_id=comment.user_id,
        user_name=current_user.full_name,
        conference_id=comment.conference_id,
        content=comment.content,
        created_at=comment.created_at,
    )


@router.get("", response_model=List[CommentRead])
async def list_comments(
    conference_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.conference_id == conference_id)
        .order_by(Comment.created_at.desc())
    )
    comments = result.scalars().all()
    return [
        CommentRead(
            id=c.id,
            user_id=c.user_id,
            user_name=c.user.full_name,
            conference_id=c.conference_id,
            content=c.content,
            created_at=c.created_at,
        )
        for c in comments
    ]
