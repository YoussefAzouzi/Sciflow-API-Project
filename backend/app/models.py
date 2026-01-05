from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from .db import Base


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    acronym = Column(String, nullable=True, index=True)
    series = Column(String, nullable=True, index=True)
    publisher = Column(String, nullable=True)  # ACM, IEEE, etc.
    location = Column(String, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    topics = Column(Text, nullable=True)
    description = Column(Text, nullable=True)   # NEW
    speakers = Column(Text, nullable=True)      # NEW (keynotes / main speakers)
    website = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    credibility = Column(Float, nullable=True)
    colocated_with = Column(String, nullable=True)

    events = relationship("Event", back_populates="conference", cascade="all, delete-orphan")
    papers = relationship("Paper", back_populates="conference", cascade="all, delete-orphan")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False, index=True)
    parent_event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # main, workshop, tutorial, competition, summer_school...
    date = Column(Date, nullable=True)
    time = Column(String, nullable=True)   # simple string for HH:MM or range
    speakers = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    conference = relationship("Conference", back_populates="events")
    parent_event = relationship("Event", remote_side=[id])
    papers = relationship("Paper", back_populates="event")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True, index=True)

    local_title = Column(Text, nullable=True)
    local_authors = Column(Text, nullable=True)

    s2_paper_id = Column(String, nullable=True, index=True)
    doi = Column(String, nullable=True, index=True)
    title = Column(Text, nullable=True)
    abstract = Column(Text, nullable=True)
    venue = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    citation_count = Column(Integer, nullable=True)
    open_access_pdf_url = Column(String, nullable=True)

    fields_of_study = Column(Text, nullable=True)

    conference = relationship("Conference", back_populates="papers")
    event = relationship("Event", back_populates="papers")
