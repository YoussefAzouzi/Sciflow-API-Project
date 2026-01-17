from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, Text, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
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
    # Enum values stored as "user"/"organizer"
    role = Column(
        SQLEnum(UserRole, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=UserRole.USER,
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    # Google Calendar integration (optional)
    google_refresh_token = Column(String, nullable=True)
    google_email = Column(String, nullable=True)

    # Relationships
    conferences = relationship("Conference", back_populates="organizer", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    interests = relationship("Interest", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
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

    is_external = Column(Boolean, default=False)
    colocated_with = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    organizer = relationship("User", back_populates="conferences")


    ratings = relationship("Rating", back_populates="conference", cascade="all, delete-orphan")
    interests = relationship("Interest", back_populates="conference", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="conference", cascade="all, delete-orphan")
    papers = relationship("Paper", back_populates="conference", cascade="all, delete-orphan")





class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False, index=True)
    rating = Column(Float, nullable=False)
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


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    conference = relationship("Conference")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conference = relationship("Conference", back_populates="papers")

