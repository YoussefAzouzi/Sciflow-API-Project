from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from ..db import get_db
from ..models import Interest, Conference, User
from ..schemas import ConferenceRead
from ..auth import get_current_user
from .conferences import build_conference_read

router = APIRouter(prefix="/interests", tags=["interests"])


@router.post("/conferences/{conference_id}/interest", status_code=201)
async def mark_interested(
    conference_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conf_result = await db.execute(select(Conference).where(Conference.id == conference_id))
    if not conf_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Conference not found")

    result = await db.execute(
        select(Interest).where(
            and_(Interest.user_id == current_user.id, Interest.conference_id == conference_id)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already marked as interested")

    interest = Interest(user_id=current_user.id, conference_id=conference_id)
    db.add(interest)
    await db.commit()
    return {"message": "Marked as interested"}


@router.delete("/conferences/{conference_id}/interest", status_code=204)
async def remove_interest(
    conference_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Interest).where(
            and_(Interest.user_id == current_user.id, Interest.conference_id == conference_id)
        )
    )
    interest = result.scalar_one_or_none()
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")

    await db.delete(interest)
    await db.commit()
    return None


@router.get("/my-interests", response_model=List[ConferenceRead])
async def get_my_interests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conference)
        .join(Interest)
        .options(selectinload(Conference.organizer), selectinload(Conference.events))
        .where(Interest.user_id == current_user.id)
    )
    conferences = result.scalars().all()
    return [await build_conference_read(c, db, current_user) for c in conferences]
