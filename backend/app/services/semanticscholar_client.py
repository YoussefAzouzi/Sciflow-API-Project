import httpx
from typing import Any, Dict, List
from ..config import settings

FIELDS = [
    "title",
    "abstract",
    "venue",
    "year",
    "citationCount",
    "openAccessPdf",
    "fieldsOfStudy",
    "externalIds",
]

class SemanticScholarClient:
    def __init__(self) -> None:
        self.base_url = settings.SEMANTIC_SCHOLAR_BASE_URL.rstrip("/")
        self.headers: Dict[str, str] = {}
        if settings.SEMANTIC_SCHOLAR_API_KEY:
            self.headers["x-api-key"] = settings.SEMANTIC_SCHOLAR_API_KEY

    async def fetch_paper(self, identifier: str) -> Dict[str, Any]:
        url = f"{self.base_url}/paper/{identifier}"
        params = {"fields": ",".join(FIELDS)}
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers, params=params, timeout=15.0)
        resp.raise_for_status()
        return resp.json()

    async def fetch_papers_bulk(self, identifiers: List[str]) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/paper/batch"
        params = {"fields": ",".join(FIELDS)}
        payload = {"ids": identifiers}
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                headers=self.headers,
                params=params,
                json=payload,
                timeout=30.0,
            )
        resp.raise_for_status()
        return resp.json()
