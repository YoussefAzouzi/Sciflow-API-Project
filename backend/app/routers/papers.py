from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..db import get_db
from ..models import Paper
from ..schemas import PaperRead, PaperCreateFromSemanticScholar
from ..services.paper_service import import_papers_for_conference

router = APIRouter(tags=["papers"])


@router.post("/conferences/{conference_id}/papers/import", response_model=List[PaperRead])
async def import_papers(
    conference_id: int,
    payload: PaperCreateFromSemanticScholar,
    db: AsyncSession = Depends(get_db),
):
    try:
        papers = await import_papers_for_conference(
            db,
            conference_id=conference_id,
            identifiers={*payload.identifiers},  # unique
            event_id=payload.event_id,
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Conference not found")
    return papers


@router.get("/conferences/{conference_id}/papers", response_model=List[PaperRead])
async def list_papers(
    conference_id: int,
    open_access_only: bool = Query(False),
    min_citations: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Paper).where(Paper.conference_id == conference_id)
    if open_access_only:
        stmt = stmt.where(Paper.open_access_pdf_url.is_not(None))
    if min_citations is not None:
        stmt = stmt.where(Paper.citation_count >= min_citations)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/papers/{paper_id}", response_model=PaperRead)
async def get_paper(
    paper_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Paper).where(Paper.id == paper_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Paper not found")
    return p
