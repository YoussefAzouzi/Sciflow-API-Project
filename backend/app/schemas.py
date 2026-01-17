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
    # colocated_with stored internally as text, exposed as list
    colocated_with: Optional[List[str]] = None
    image_url: Optional[str] = None


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
    colocated_with: Optional[List[str]] = None
    image_url: Optional[str] = None


class ConferenceRead(ConferenceBase):
    id: int
    organizer_id: Optional[int] = None
    organizer_name: Optional[str] = None
    avg_rating: Optional[float] = None
    rating: Optional[float] = None
    total_ratings: int = 0
    total_interests: int = 0
    user_rating: Optional[float] = None
    user_interested: bool = False

    papers: List["PaperRead"] = []
    created_at: datetime
    source: str = "sciflow"
    is_external: bool = False


    class Config:
        orm_mode = True


class RatingCreate(BaseModel):
    rating: float


class RatingRead(BaseModel):
    id: int
    user_id: int
    conference_id: int
    rating: float
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


class NotificationRead(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    conference_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True


class PaperCreate(BaseModel):
    title: str
    url: str


class PaperRead(BaseModel):
    id: int
    conference_id: int
    title: str
    url: str
    created_at: datetime

    class Config:
        orm_mode = True


ConferenceRead.update_forward_refs()
