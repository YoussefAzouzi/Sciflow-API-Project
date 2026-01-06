from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ORGANIZER = "organizer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    created_at: datetime

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserRead


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
    conference_id: int

    class Config:
        orm_mode = True


class ConferenceBase(BaseModel):
    name: str
    acronym: Optional[str] = None
    series: Optional[str] = None
    publisher: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    topics: Optional[str] = None
    description: Optional[str] = None
    speakers: Optional[str] = None
    website: Optional[str] = None
    colocated_with: Optional[str] = None


class ConferenceCreate(ConferenceBase):
    pass


class ConferenceUpdate(BaseModel):
    name: Optional[str] = None
    acronym: Optional[str] = None
    series: Optional[str] = None
    publisher: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    topics: Optional[str] = None
    description: Optional[str] = None
    speakers: Optional[str] = None
    website: Optional[str] = None
    colocated_with: Optional[str] = None


class ConferenceRead(ConferenceBase):
    id: int
    organizer_id: int
    organizer_name: str
    avg_rating: Optional[float] = None
    avg_credibility: Optional[float] = None
    total_ratings: int = 0
    total_interests: int = 0
    user_rating: Optional[float] = None
    user_interested: bool = False
    events: List[EventRead] = []
    created_at: datetime

    class Config:
        orm_mode = True


class RatingCreate(BaseModel):
    rating: float
    credibility: Optional[float] = None


class RatingRead(BaseModel):
    id: int
    user_id: int
    conference_id: int
    rating: float
    credibility: Optional[float]
    created_at: datetime

    class Config:
        orm_mode = True


class CommentCreate(BaseModel):
    content: str


class CommentRead(BaseModel):
    id: int
    user_id: int
    user_name: str
    conference_id: int
    content: str
    created_at: datetime

    class Config:
        orm_mode = True
