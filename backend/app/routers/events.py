from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..db import get_db
from ..models import Conference, Event
from ..schemas import EventCreate, EventRead

router = APIRouter(
    prefix="/conferences/{conference_id}/events",
    tags=["events"],
)

@router.post("", response_model=EventRead, status_code=201)
async def create_event(
    conference_id: int,
    payload: EventCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Conference).where(Conference.id == conference_id))
    conf = result.scalar_one_or_none()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")

    ev = Event(conference_id=conference_id, **payload.dict())
    db.add(ev)
    await db.commit()
    await db.refresh(ev)
    return ev

@router.get("", response_model=List[EventRead])
async def list_events(
    conference_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.conference_id == conference_id))
    return result.scalars().all()
