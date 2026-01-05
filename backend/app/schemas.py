from datetime import date
from typing import List, Optional
from pydantic import BaseModel


class EventBase(BaseModel):
    title: str
    type: str
    date: Optional[date] = None
    time: Optional[str] = None
    speakers: Optional[str] = None
    description: Optional[str] = None
    parent_event_id: Optional[int] = None


class EventCreate(EventBase):
    pass


class EventRead(EventBase):
    id: int

    class Config:
        from_attributes = True


class ConferenceBase(BaseModel):
    name: str
    acronym: Optional[str] = None
    series: Optional[str] = None
    publisher: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    topics: Optional[str] = None
    description: Optional[str] = None    # NEW
    speakers: Optional[str] = None       # NEW
    website: Optional[str] = None
    rating: Optional[float] = None
    credibility: Optional[float] = None
    colocated_with: Optional[str] = None


class ConferenceCreate(ConferenceBase):
    pass


class ConferenceRead(ConferenceBase):
    id: int
    events: List[EventRead] = []
    paper_count: int = 0                  # NEW

    class Config:
        from_attributes = True


class PaperCreateFromSemanticScholar(BaseModel):
    # conference_id comes from path; no need to repeat here
    event_id: Optional[int] = None
    identifiers: list[str]


class PaperRead(BaseModel):
    id: int
    conference_id: int
    event_id: Optional[int]
    title: Optional[str]
    abstract: Optional[str]
    venue: Optional[str]
    year: Optional[int]
    citation_count: Optional[int]
    open_access_pdf_url: Optional[str]
    fields_of_study: Optional[str]

    class Config:
        from_attributes = True
