from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import engine, Base
from .routers import conferences, events, auth, ratings, interests, comments, users

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
app.include_router(events.router)
app.include_router(ratings.router)
app.include_router(interests.router)
app.include_router(comments.router)
app.include_router(users.router)
