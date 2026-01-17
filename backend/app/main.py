from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .db import engine, Base
from .routers import conferences, auth, ratings, interests, comments, users, notifications
from .routers import google_integration  # NEW

app = FastAPI(
    title="Sciflow API",
    description="Scientific conference discovery platform",
    version="2.0.0",
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(auth.router)
app.include_router(conferences.router)

app.include_router(ratings.router)
app.include_router(interests.router)
app.include_router(comments.router)
app.include_router(users.router)
app.include_router(google_integration.router)  # NEW
app.include_router(notifications.router)

# Mount static files
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
