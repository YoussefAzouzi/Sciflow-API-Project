from .conferences import router as conferences_router
from .events import router as events_router
from .papers import router as papers_router

__all__ = ["conferences_router", "events_router", "papers_router"]
