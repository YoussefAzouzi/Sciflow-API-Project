from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import engine, Base
from .routers import conferences_router, events_router, papers_router

app = FastAPI(
    title="Scientific Conferences Tracker API",
    description="Tracks scientific conferences, events, and papers with Semantic Scholar enrichment.",
    version="0.1.0",
)

# Allow frontend at localhost:5173 to call the API
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


app.include_router(conferences_router)
app.include_router(events_router)
app.include_router(papers_router)
