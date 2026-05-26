import os
import tempfile
import httpx
from fastapi import HTTPException
from services.teams_service import _get_app_token

def fetch_and_upload_recording(
    tenant_id: str, 
    client_id: str, 
    client_secret: str, 
    organizer_id: str, 
    graph_meeting_id: str, 
    drive_id: str,          # <-- Using drive_id for Standard SharePoint
    meeting_title: str,
    vessel_name: str
) -> str:
    
    # Get the authentication token
    token = _get_app_token(tenant_id, client_id, client_secret)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Call Graph API to get the recording metadata from OneDrive
    recordings_url = f"https://graph.microsoft.com/v1.0/users/{organizer_id}/onlineMeetings/{graph_meeting_id}/recordings"
    resp = httpx.get(recordings_url, headers=headers, timeout=30)

    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch recordings list from Graph API.")

    recordings = resp.json().get("value", [])
    if not recordings:
        raise HTTPException(status_code=404, detail="No recording found. It might still be processing (wait 5-15 mins).")

    # Get the first recording ID
    recording_id = recordings[0]["id"]
    
    # 2. Get the Content URL (Download Link)
    content_url = recordings[0].get("contentUrl")
    if not content_url:
        content_url = f"https://graph.microsoft.com/v1.0/users/{organizer_id}/onlineMeetings/{graph_meeting_id}/recordings/{recording_id}/content"

    # 3. Download the video to a temporary file (prevents RAM crash for large videos)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
        temp_file_name = tmp_file.name
        with httpx.stream("GET", content_url, headers=headers, follow_redirects=True) as r:
            if r.status_code != 200:
                os.remove(temp_file_name)
                raise HTTPException(status_code=400, detail="Failed to download recording file from OneDrive.")
            for chunk in r.iter_bytes():
                tmp_file.write(chunk)

    # 4. Upload to Standard SharePoint Online using the Drive ID
    # Clean up the vessel name and meeting title so they are safe for folder/file names
    safe_vessel_name = "".join([c for c in (vessel_name or "Unknown_Vessel") if c.isalnum() or c == ' ']).rstrip().replace(' ', '_')
    safe_title = "".join([c for c in meeting_title if c.isalnum() or c == ' ']).rstrip().replace(' ', '_')
    file_name = f"{safe_title}_{graph_meeting_id[-5:]}.mp4"
    
    # Notice the capital 'R' in Recordings to match your SharePoint folder!
    upload_url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/root:/Recordings/{safe_vessel_name}/{file_name}:/content"
    
    try:
        with open(temp_file_name, "rb") as f:
            upload_resp = httpx.put(
                upload_url,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "video/mp4"
                },
                content=f,
                timeout=300.0  # 5 minutes timeout for large video uploads
            )
    finally:
        # 5. Clean up the temporary file from the server no matter what happens
        if os.path.exists(temp_file_name):
            os.remove(temp_file_name)

    if upload_resp.status_code not in (200, 201):
        raise HTTPException(status_code=400, detail=f"Failed to upload to SharePoint: {upload_resp.text}")

    # 6. Return the webUrl (formatted for embedding in React iframe)
    web_url = upload_resp.json().get("webUrl")
    if web_url:
        return web_url.split("?")[0] + "?action=embedview"
    
    raise HTTPException(status_code=500, detail="Upload succeeded but no webUrl was returned.")