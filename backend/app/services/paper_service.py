from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models import Paper, Conference
from .semanticscholar_client import SemanticScholarClient

async def import_papers_for_conference(
    db: AsyncSession,
    conference_id: int,
    identifiers: List[str],
    event_id: int | None = None,
) -> List[Paper]:
    result = await db.execute(select(Conference).where(Conference.id == conference_id))
    conference = result.scalar_one_or_none()
    if not conference:
        raise ValueError("Conference not found")

    client = SemanticScholarClient()
    raw_papers = await client.fetch_papers_bulk(identifiers)

    created: List[Paper] = []
    for raw in raw_papers:
        if raw is None:
            continue

        oa_pdf = raw.get("openAccessPdf") or {}
        pdf_url = oa_pdf.get("url")
        fields_of_study = raw.get("fieldsOfStudy") or []
        fields_str = ", ".join(fields_of_study)

        paper = Paper(
            conference_id=conference_id,
            event_id=event_id,
            s2_paper_id=raw.get("paperId"),
            doi=(raw.get("externalIds") or {}).get("DOI"),
            title=raw.get("title"),
            abstract=raw.get("abstract"),
            venue=raw.get("venue"),
            year=raw.get("year"),
            citation_count=raw.get("citationCount"),
            open_access_pdf_url=pdf_url,
            fields_of_study=fields_str,
        )
        db.add(paper)
        created.append(paper)

    await db.commit()
    for p in created:
        await db.refresh(p)
    return created
