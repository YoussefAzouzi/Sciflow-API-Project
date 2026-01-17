from typing import Optional
import json
import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..db import get_db
from ..models import User, Conference
from ..auth import get_current_user
from ..google_calendar import get_flow, create_calendar_event

router = APIRouter(prefix="/google", tags=["google"])


@router.get("/connect")
async def connect_google(
    conference_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the Google OAuth URL for the currently logged-in user.
    Frontend should redirect the browser to auth_url.
    """
    flow = get_flow()
    
    # Store user ID and conference ID in state so we can recover them in callback
    state_data = {
        "user_id": current_user.id,
        "conference_id": conference_id
    }
    state_str = json.dumps(state_data)
    
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state_str
    )
    return {"auth_url": auth_url}


@router.get("/callback")
async def google_callback(
    code: str,
    state: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Google redirects here after the user approves.
    """
    flow = get_flow()
    flow.fetch_token(code=code)

    creds = flow.credentials
    if not creds.refresh_token:
        # If we didn't get a refresh token, it might be because the user already approved.
        # But for 'offline' access/prompt='consent', we usually get it.
        pass

    # Recover state
    user_id = None
    conference_id = None
    if state:
        try:
            state_data = json.loads(state)
            user_id = state_data.get("user_id")
            conference_id = state_data.get("conference_id")
        except:
            pass

    if user_id:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            if creds.refresh_token:
                user.google_refresh_token = creds.refresh_token
            
            # Also get email from Google to be safe
            userinfo_resp = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {creds.token}"},
                timeout=10,
            )
            if userinfo_resp.status_code == 200:
                userinfo = userinfo_resp.json()
                user.google_email = userinfo.get("email")
            
            db.add(user)
            await db.commit()

    # Redirect back to frontend
    frontend_url = "http://localhost:5173"
    if conference_id:
        return RedirectResponse(url=f"{frontend_url}/conferences/{conference_id}?google_connected=true")
    
    return RedirectResponse(url=f"{frontend_url}/?google_connected=true")


@router.post("/conferences/{conference_id}/add")
async def add_conference_to_calendar(
    conference_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a Google Calendar event for this conference using the
    refresh token stored for the current user.
    """
    if not current_user.google_refresh_token:
        raise HTTPException(status_code=400, detail="Google Calendar not connected")

    result = await db.execute(select(Conference).where(Conference.id == conference_id))
    conf = result.scalar_one_or_none()
    if not conf:
        raise HTTPException(status_code=404, detail="Conference not found")

    event_link = create_calendar_event(
        refresh_token=current_user.google_refresh_token,
        summary=conf.name,
        description=(conf.description or "") + f"\nWebsite: {conf.website or ''}",
        location=conf.location,
        start_date=conf.start_date,
        end_date=conf.end_date,
    )

    return {"message": "Event created in Google Calendar", "event_link": event_link}
