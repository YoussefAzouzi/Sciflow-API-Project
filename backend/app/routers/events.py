from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..db import get_db
from ..models import Event, Conference, User
from ..schemas import EventCreate, EventRead
from ..auth import get_current_organizer

router = APIRouter(prefix="/conferences/{conference_id}/events", tags=["events"])


@router.post("", response_model=EventRead, status_code=201)
async def create_event(
    conference_id: int,
    payload: EventCreate,
    current_user: User = Depends(get_current_organizer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Conference).where(Conference.id == conference_id))
    conf = result.scalar_one_or_none()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")
    if conf.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    event = Event(**payload.dict(), conference_id=conference_id)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.get("", response_model=List[EventRead])
async def list_events(
    conference_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.conference_id == conference_id))
    events = result.scalars().all()
    return events


@router.put("/{event_id}", response_model=EventRead)
async def update_event(
    conference_id: int,
    event_id: int,
    payload: EventCreate,
    current_user: User = Depends(get_current_organizer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event or event.conference_id != conference_id:
        raise HTTPException(status_code=404, detail="Event not found")

    conf_result = await db.execute(select(Conference).where(Conference.id == conference_id))
    conf = conf_result.scalar_one_or_none()
    if conf.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(event, field, value)

    await db.commit()
    await db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
async def delete_event(
    conference_id: int,
    event_id: int,
    current_user: User = Depends(get_current_organizer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event or event.conference_id != conference_id:
        raise HTTPException(status_code=404, detail="Event not found")

    conf_result = await db.execute(select(Conference).where(Conference.id == conference_id))
    conf = conf_result.scalar_one_or_none()
    if conf.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.delete(event)
    await db.commit()
    return None
