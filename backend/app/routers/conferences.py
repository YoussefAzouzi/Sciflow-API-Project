from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..db import get_db
from ..models import Conference
from ..schemas import ConferenceCreate, ConferenceRead, EventRead

router = APIRouter(prefix="/conferences", tags=["conferences"])


def to_conference_read(conf: Conference, include_events: bool = False) -> ConferenceRead:
    """
    Map a Conference ORM object into a ConferenceRead Pydantic model.

    IMPORTANT: Only call this helper on Conference instances that were
    loaded with selectinload(Conference.papers) if you need paper_count,
    otherwise accessing conf.papers would trigger a lazy load and cause
    a MissingGreenlet error in async code.
    """
    return ConferenceRead(
        id=conf.id,
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
        rating=conf.rating,
        credibility=conf.credibility,
        colocated_with=conf.colocated_with,
        events=[
            EventRead(
                id=e.id,
                title=e.title,
                type=e.type,
                date=e.date,
                time=e.time,
                speakers=e.speakers,
                description=e.description,
                parent_event_id=e.parent_event_id,
            )
            for e in (conf.events or [])
        ]
        if include_events
        else [],
        paper_count=len(conf.papers or []),
    )


@router.post("", response_model=ConferenceRead, status_code=201)
async def create_conference(
    payload: ConferenceCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new conference.

    Returns a ConferenceRead without touching conf.papers to avoid
    triggering a lazy load (which would raise MissingGreenlet).
    paper_count is always 0 on creation.
    """
    conf = Conference(**payload.dict())
    db.add(conf)
    await db.commit()
    await db.refresh(conf)

    return ConferenceRead(
        id=conf.id,
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
        rating=conf.rating,
        credibility=conf.credibility,
        colocated_with=conf.colocated_with,
        events=[],
        paper_count=0,
    )


@router.get("", response_model=List[ConferenceRead])
async def list_conferences(
    publisher: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    min_credibility: Optional[float] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    List conferences with optional filters.

    This endpoint stays lightweight and does not eager-load events or papers;
    paper_count is always 0 here (or you can add a second query if needed).
    """
    stmt = select(Conference)
    if publisher:
        stmt = stmt.where(Conference.publisher == publisher)
    if min_rating is not None:
        stmt = stmt.where(Conference.rating >= min_rating)
    if min_credibility is not None:
        stmt = stmt.where(Conference.credibility >= min_credibility)

    result = await db.execute(stmt)
    conferences = result.scalars().all()

    # Do NOT access conf.papers here (would lazy-load).
    return [
        ConferenceRead(
            id=c.id,
            name=c.name,
            acronym=c.acronym,
            series=c.series,
            publisher=c.publisher,
            location=c.location,
            start_date=c.start_date,
            end_date=c.end_date,
            topics=c.topics,
            description=c.description,
            speakers=c.speakers,
            website=c.website,
            rating=c.rating,
            credibility=c.credibility,
            colocated_with=c.colocated_with,
            events=[],
            paper_count=0,
        )
        for c in conferences
    ]


@router.get("/{conference_id}", response_model=ConferenceRead)
async def get_conference(
    conference_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a single conference with full detail, including events and paper_count.

    Here we eager-load events and papers using selectinload, so accessing
    conf.papers in to_conference_read is safe.
    """
    stmt = (
        select(Conference)
        .options(
            selectinload(Conference.events),
            selectinload(Conference.papers),
        )
        .where(Conference.id == conference_id)
    )
    result = await db.execute(stmt)
    conf = result.scalar_one_or_none()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    return to_conference_read(conf, include_events=True)
