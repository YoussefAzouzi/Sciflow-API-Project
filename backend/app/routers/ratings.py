from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from ..db import get_db
from ..models import Rating, Conference, User
from ..schemas import RatingCreate, RatingRead
from ..auth import get_current_user

router = APIRouter(prefix="/conferences/{conference_id}/ratings", tags=["ratings"])


@router.post("", response_model=RatingRead, status_code=201)
async def create_or_update_rating(
    conference_id: int,
    payload: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conf_result = await db.execute(select(Conference).where(Conference.id == conference_id))
    if not conf_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Conference not found")

    result = await db.execute(
        select(Rating).where(
            and_(Rating.user_id == current_user.id, Rating.conference_id == conference_id)
        )
    )
    rating = result.scalar_one_or_none()

    if rating:
        rating.rating = payload.rating
        rating.credibility = payload.credibility
    else:
        rating = Rating(
            user_id=current_user.id,
            conference_id=conference_id,
            rating=payload.rating,
            credibility=payload.credibility,
        )
        db.add(rating)

    await db.commit()
    await db.refresh(rating)
    return rating
