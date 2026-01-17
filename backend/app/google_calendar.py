# backend/app/google_calendar.py

import os
import json
import datetime
from typing import Optional

from fastapi import HTTPException
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # .../backend/app
CLIENT_SECRETS_FILE = os.path.join(BASE_DIR, "google_client_secret.json")


def _load_raw_client_config():
    if not os.path.exists(CLIENT_SECRETS_FILE):
        raise HTTPException(status_code=500, detail="Google client secrets file not found")

    with open(CLIENT_SECRETS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Handle both {"web": {...}} and plain {...}
    if "web" in data:
        cfg = data["web"]
    else:
        cfg = data

    required = ("client_id", "client_secret")
    for k in required:
        if k not in cfg:
            raise HTTPException(status_code=500, detail=f"Missing {k} in Google client secrets")

    return cfg


def get_flow() -> Flow:
    """
    Build OAuth Flow from secrets file.
    """
    if not os.path.exists(CLIENT_SECRETS_FILE):
        raise HTTPException(status_code=500, detail="Google client secrets file not found")

    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
    )
    flow.redirect_uri = "http://127.0.0.1:8000/google/callback"
    return flow


def build_credentials(refresh_token: str) -> Credentials:
    """
    Recreate credentials using refresh token and client id/secret.
    """
    cfg = _load_raw_client_config()

    creds = Credentials(
        None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=cfg["client_id"],
        client_secret=cfg["client_secret"],
        scopes=SCOPES,
    )
    creds.refresh(Request())
    if not creds.valid:
        raise HTTPException(status_code=400, detail="Invalid Google credentials")
    return creds


def create_calendar_event(
    refresh_token: str,
    summary: str,
    description: str,
    location: Optional[str],
    start_date: Optional[datetime.date],
    end_date: Optional[datetime.date],
) -> str:
    """
    Create an all‑day event in user's primary Google Calendar.
    """
    creds = build_credentials(refresh_token)
    service = build("calendar", "v3", credentials=creds)

    if not start_date:
        start_date = datetime.date.today()
    if not end_date:
        end_date = start_date

    event_body = {
        "summary": summary,
        "location": location or "",
        "description": description or "",
        "start": {"date": start_date.isoformat(), "timeZone": "UTC"},
        "end": {
            "date": (end_date + datetime.timedelta(days=1)).isoformat(),
            "timeZone": "UTC",
        },
    }

    event = service.events().insert(calendarId="primary", body=event_body).execute()
    return event.get("htmlLink")
