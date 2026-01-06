from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..db import get_db
from ..models import User, Conference
from ..schemas import ConferenceRead, UserRead
from ..auth import get_current_user, get_current_organizer
from .conferences import build_conference_read

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/me/conferences", response_model=List[ConferenceRead])
async def get_my_conferences(
    current_user: User = Depends(get_current_organizer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conference)
        .options(selectinload(Conference.organizer), selectinload(Conference.events))
        .where(Conference.organizer_id == current_user.id)
    )
    conferences = result.scalars().all()
    return [await build_conference_read(c, db, current_user) for c in conferences]
