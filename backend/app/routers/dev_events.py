import httpx
import xml.etree.ElementTree as ET
import re
from datetime import datetime, date
from typing import List, Optional
from ..schemas import ConferenceRead

RSS_URL = "https://dev.events/rss.xml"

async def fetch_dev_events() -> List[ConferenceRead]:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(RSS_URL, timeout=10.0)
            response.raise_for_status()
        except Exception as e:
            print(f"Error fetching dev.events RSS: {e}")
            return []

    try:
        root = ET.fromstring(response.content)
    except ET.ParseError as e:
        print(f"Error parsing RSS XML: {e}")
        return []

    conferences = []
    
    # Namespace handling might be needed if RSS uses them, but usually standard RSS 2.0 is simple.
    # dev.events RSS items have title, link, description, pubDate, category.
    
    for item in root.findall(".//item"):
        title = item.find("title").text if item.find("title") is not None else "Unknown Conference"
        link = item.find("link").text if item.find("link") is not None else ""
        description = item.find("description").text if item.find("description") is not None else ""
        
        # Parse description for Date and Location
        # Format example: "Clean Code: The Next Level is happening on September 24, 2026, Online. More information: ..."
        # Regex: (.*?) is happening on (.*?), (.*?)\. More information:
        
        start_date = None
        location = "Unknown"
        
        match = re.search(r"is happening on (.*?), (.*?)\. More information:", description)
        if match:
            date_str = match.group(1).strip() # e.g. "September 24, 2026" or "Sep 24-25 2026"
            location = match.group(2).strip()
            
            # Try to parse date
            try:
                # Handle "September 24, 2026"
                dt = datetime.strptime(date_str, "%B %d, %Y")
                start_date = dt.date()
            except ValueError:
                try:
                     # Handle "Sep 24-25 2026" - complicated, maybe just take the first part?
                     # Let's try basic single date parsing or ignore.
                     # If format is Month Day, Year
                     # If format is Month Day-Day Year
                     pass
                except:
                     pass
        
        import zlib
        # Generate a stable fake ID (positive integer) from the link
        conf_id = (zlib.adler32(link.encode()) & 0xffffffff) % 9000000 + 1000000
        
        # Create ConferenceRead object
        # We need to fill required fields
        conf = ConferenceRead(
            id=conf_id,
            organizer_id=0, # Placeholder
            organizer_name="Dev.Events",
            name=title,
            description=description,
            location=location,
            start_date=start_date,
            website=link,
            created_at=datetime.now(),
            source="dev.events",
            # Optional fields defaults
            total_ratings=0,
            total_interests=0,
            user_interested=False,
            avg_rating=None,
            user_rating=None,

        )
        conferences.append(conf)
        
    return conferences
