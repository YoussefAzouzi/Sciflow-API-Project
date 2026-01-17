from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
import uuid
import os
import shutil

from ..db import get_db
from ..models import Conference, User, Rating, Interest, Notification, Paper
from ..schemas import ConferenceCreate, ConferenceRead, ConferenceUpdate, PaperRead, PaperCreate
from ..auth import get_current_user, get_current_organizer, get_current_user_optional

from .dev_events import fetch_dev_events
import httpx
import asyncio

router = APIRouter(prefix="/conferences", tags=["conferences"])



def parse_colocated(text: Optional[str]) -> Optional[list]:
    if not text:
        return None
    parts = [p.strip() for p in text.split(",") if p.strip()]
    return parts or None


def serialize_colocated(values: Optional[list]) -> Optional[str]:
    if not values:
        return None
    return ", ".join(values)


async def build_conference_read(
    conf: Conference,
    db: AsyncSession,
    current_user: Optional[User] = None
) -> ConferenceRead:
    rating_result = await db.execute(
        select(
            func.avg(Rating.rating),
            func.count(Rating.id)
        ).where(Rating.conference_id == conf.id)
    )
    avg_rating, total_ratings = rating_result.one()

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
        organizer_name=conf.organizer.full_name if conf.organizer else "Unknown",
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
        image_url=conf.image_url,
        colocated_with=parse_colocated(conf.colocated_with),
        avg_rating=float(avg_rating) if avg_rating else None,
        rating=float(avg_rating) if avg_rating else None,
        total_ratings=total_ratings or 0,
        total_interests=total_interests or 0,
        user_rating=user_rating,
        user_interested=user_interested,

        papers=[
            PaperRead(
                id=p.id,
                conference_id=p.conference_id,
                title=p.title,
                url=p.url,
                created_at=p.created_at
            )
            for p in (conf.papers or [])
        ],
        created_at=conf.created_at,
        source="dev.events" if conf.is_external else "sciflow",
        is_external=conf.is_external or False
    )



@router.post("", response_model=ConferenceRead, status_code=201)
async def create_conference(
    payload: ConferenceCreate,
    current_user: User = Depends(get_current_organizer),
    db: AsyncSession = Depends(get_db),
):
    data = payload.dict()
    colocated = serialize_colocated(data.pop("colocated_with", None))
    conf = Conference(
        **data,
        colocated_with=colocated,
        organizer_id=current_user.id
    )
    db.add(conf)
    await db.commit()

    result = await db.execute(
        select(Conference)
        .options(selectinload(Conference.organizer), selectinload(Conference.papers))
        .where(Conference.id == conf.id)
    )
    conf = result.scalar_one()

    # Create notifications for all users
    user_result = await db.execute(select(User.id))
    user_ids = user_result.scalars().all()
    
    for uid in user_ids:
        # Don't notify the organizer who created it (optional, but cleaner)
        if uid == current_user.id:
            continue
            
        notif = Notification(
            user_id=uid,
            title="New Conference Posted!",
            content=f"'{conf.name}' has just been added. Check it out!",
            conference_id=conf.id
        )
        db.add(notif)
    
    await db.commit()

    # Re-fetch after commit to avoid expired/detached object issues
    result = await db.execute(
        select(Conference)
        .options(selectinload(Conference.organizer), selectinload(Conference.papers))
        .where(Conference.id == conf.id)
    )
    conf = result.scalar_one()

    return await build_conference_read(conf, db, current_user)


@router.get("", response_model=List[ConferenceRead])
async def list_conferences(
    publisher: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    stmt = select(Conference).options(
        selectinload(Conference.organizer), 
        selectinload(Conference.papers)
    )

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

    # Merge external conferences from dev.events
    if not publisher and not min_rating:
        external_confs = await fetch_dev_events()
        existing_websites = {c.website for c in response if c.website}
        for ext in external_confs:
            if ext.website not in existing_websites:
                response.append(ext)

    return response


@router.get("/{conference_id}", response_model=ConferenceRead)
async def get_conference(
    conference_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    stmt = (
        select(Conference)
        .options(selectinload(Conference.organizer), selectinload(Conference.papers))
        .where(Conference.id == conference_id)
    )
    result = await db.execute(stmt)
    conf = result.scalar_one_or_none()
    
    if not conf:
        # Check if it's an external conference from dev.events RSS
        external_confs = await fetch_dev_events()
        target = next((c for c in external_confs if c.id == conference_id), None)
        if target:
            # Create a local record so users can interact with it
            new_conf = Conference(
                name=target.name,
                description=target.description,
                location=target.location,
                start_date=target.start_date,
                website=target.website,
                is_external=True,
                organizer_id=None
            )
            db.add(new_conf)
            await db.commit()
            await db.refresh(new_conf)
            
            # Re-fetch to get relationships and full data
            stmt = (
                select(Conference)
                .options(selectinload(Conference.organizer), selectinload(Conference.papers))
                .where(Conference.id == new_conf.id)
            )
            result = await db.execute(stmt)
            conf = result.scalar_one()
        else:
            raise HTTPException(status_code=404, detail="Conference not found")
            
    return await build_conference_read(conf, db, current_user)


@router.patch("/{conference_id}", response_model=ConferenceRead)
async def update_conference(
    conference_id: int,
    payload: ConferenceUpdate,
    current_user: User = Depends(get_current_organizer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conference)
        .options(selectinload(Conference.organizer), selectinload(Conference.papers))
        .where(Conference.id == conference_id)
    )
    conf = result.scalar_one_or_none()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    if conf.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    data = payload.dict(exclude_unset=True)
    if "colocated_with" in data:
        conf.colocated_with = serialize_colocated(data.pop("colocated_with"))

    for field, value in data.items():
        setattr(conf, field, value)

    await db.commit()

    # Re-fetch after commit to avoid expired/detached object issues
    result = await db.execute(
        select(Conference)
        .options(selectinload(Conference.organizer), selectinload(Conference.papers))
        .where(Conference.id == conf.id)
    )
    conf = result.scalar_one()

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


@router.post("/{conference_id}/papers", response_model=PaperRead)
async def add_paper(
    conference_id: int,
    payload: PaperCreate,
    current_user: User = Depends(get_current_organizer),
    db: AsyncSession = Depends(get_db)
):
    # Check conference and ownership
    result = await db.execute(select(Conference).where(Conference.id == conference_id))
    conf = result.scalar_one_or_none()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    if conf.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    paper = Paper(
        conference_id=conference_id,
        title=payload.title,
        url=payload.url
    )
    db.add(paper)
    
    # Notify users about new paper
    user_result = await db.execute(select(User.id))
    user_ids = user_result.scalars().all()
    for uid in user_ids:
        if uid == current_user.id:
            continue
        notif = Notification(
            user_id=uid,
            title="New Research Paper Added",
            content=f"A new paper '{payload.title}' has been added to '{conf.name}'.",
            conference_id=conf.id
        )
        db.add(notif)
        
    await db.commit()
    await db.refresh(paper)

    return PaperRead(
        id=paper.id,
        conference_id=paper.conference_id,
        title=paper.title,
        url=paper.url,
        created_at=paper.created_at
    )
