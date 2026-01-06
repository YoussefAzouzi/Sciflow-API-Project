from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, Text, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from .db import Base


class UserRole(enum.Enum):
    USER = "user"
    ORGANIZER = "organizer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole, values_callable=lambda x: [e.value for e in x]), nullable=False, default=UserRole.USER)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conferences = relationship("Conference", back_populates="organizer", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    interests = relationship("Interest", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    acronym = Column(String, nullable=True, index=True)
    series = Column(String, nullable=True, index=True)
    publisher = Column(String, nullable=True)
    location = Column(String, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    topics = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    speakers = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    colocated_with = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    organizer = relationship("User", back_populates="conferences")
    events = relationship("Event", back_populates="conference", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="conference", cascade="all, delete-orphan")
    interests = relationship("Interest", back_populates="conference", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="conference", cascade="all, delete-orphan")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False, index=True)
    parent_event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    date = Column(Date, nullable=True)
    time = Column(String, nullable=True)
    speakers = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    conference = relationship("Conference", back_populates="events")
    parent_event = relationship("Event", remote_side=[id])


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False, index=True)
    rating = Column(Float, nullable=False)
    credibility = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ratings")
    conference = relationship("Conference", back_populates="ratings")


class Interest(Base):
    __tablename__ = "interests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interests")
    conference = relationship("Conference", back_populates="interests")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="comments")
    conference = relationship("Conference", back_populates="comments")
