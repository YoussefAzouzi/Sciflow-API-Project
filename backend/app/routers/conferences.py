from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from ..db import get_db
from ..models import Conference, User, Rating, Interest
from ..schemas import ConferenceCreate, ConferenceRead, ConferenceUpdate, EventRead
from ..auth import get_current_user, get_current_organizer

router = APIRouter(prefix="/conferences", tags=["conferences"])


async def build_conference_read(
    conf: Conference,
    db: AsyncSession,
    current_user: Optional[User] = None
) -> ConferenceRead:
    rating_result = await db.execute(
        select(
            func.avg(Rating.rating),
            func.avg(Rating.credibility),
            func.count(Rating.id)
        ).where(Rating.conference_id == conf.id)
    )
    avg_rating, avg_cred, total_ratings = rating_result.one()

    interests_result = await db.execute(
        select(func.count(Interest.id)).where(Interest.conference_id == conf.id)
    )
    total_interests = interests_result.scalar()

    user_rating = None
    user_interested = False

    if current_user:
        user_rating_result = await db.execute(
            select(Rating.rating).where(
                and_(Rating.user_id == current_user.id, Rating.conference_id == conf.id)
            )
        )
        user_rating = user_rating_result.scalar_one_or_none()

        user_interest_result = await db.execute(
            select(Interest.id).where(
                and_(Interest.user_id == current_user.id, Interest.conference_id == conf.id)
            )
        )
        user_interested = user_interest_result.scalar_one_or_none() is not None

    return ConferenceRead(
        id=conf.id,
        organizer_id=conf.organizer_id,
        organizer_name=conf.organizer.full_name,
        name=conf.name,
        acronym=conf.acronym,
        series=conf.series,
        publisher=conf.publisher,
        location=conf.location,
        start_date=conf.start_date,
        end_date=conf.end_date,
        topics=conf.topics,
        description=conf.description,
        speakers=conf.speakers,
        website=conf.website,
        colocated_with=conf.colocated_with,
        avg_rating=float(avg_rating) if avg_rating else None,
        avg_credibility=float(avg_cred) if avg_cred else None,
        total_ratings=total_ratings or 0,
        total_interests=total_interests or 0,
        user_rating=user_rating,
        user_interested=user_interested,
        events=[
            EventRead(
                id=e.id,
                conference_id=e.conference_id,
                title=e.title,
                type=e.type,
                date=e.date,
                time=e.time,
                speakers=e.speakers,
                description=e.description,
                parent_event_id=e.parent_event_id,
            )
            for e in (conf.events or [])
        ],
        created_at=conf.created_at,
    )


@router.post("", response_model=ConferenceRead, status_code=201)
async def create_conference(
    payload: ConferenceCreate,
    current_user: User = Depends(get_current_organizer),
    db: AsyncSession = Depends(get_db),
):
    conf = Conference(**payload.dict(), organizer_id=current_user.id)
    db.add(conf)
    await db.commit()
    
    # Reload with relationships
    result = await db.execute(
        select(Conference)
        .options(selectinload(Conference.organizer), selectinload(Conference.events))
        .where(Conference.id == conf.id)
    )
    conf = result.scalar_one()
    
    return await build_conference_read(conf, db, current_user)


@router.get("", response_model=List[ConferenceRead])
async def list_conferences(
    publisher: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    stmt = select(Conference).options(selectinload(Conference.organizer), selectinload(Conference.events))

    if publisher:
        stmt = stmt.where(Conference.publisher == publisher)

    result = await db.execute(stmt)
    conferences = result.scalars().all()

    response = []
    for conf in conferences:
        conf_read = await build_conference_read(conf, db, current_user)
        if min_rating and (conf_read.avg_rating is None or conf_read.avg_rating < min_rating):
            continue
        response.append(conf_read)

    return response


@router.get("/{conference_id}", response_model=ConferenceRead)
async def get_conference(
    conference_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    stmt = (
        select(Conference)
        .options(selectinload(Conference.organizer), selectinload(Conference.events))
        .where(Conference.id == conference_id)
    )
    result = await db.execute(stmt)
    conf = result.scalar_one_or_none()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    return await build_conference_read(conf, db, current_user)


@router.put("/{conference_id}", response_model=ConferenceRead)
async def update_conference(
    conference_id: int,
    payload: ConferenceUpdate,
    current_user: User = Depends(get_current_organizer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conference)
        .options(selectinload(Conference.organizer), selectinload(Conference.events))
        .where(Conference.id == conference_id)
    )
    conf = result.scalar_one_or_none()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    if conf.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(conf, field, value)

    await db.commit()
    await db.refresh(conf)
    return await build_conference_read(conf, db, current_user)


@router.delete("/{conference_id}", status_code=204)
async def delete_conference(
    conference_id: int,
    current_user: User = Depends(get_current_organizer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Conference).where(Conference.id == conference_id))
    conf = result.scalar_one_or_none()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    if conf.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.delete(conf)
    await db.commit()
    return None
