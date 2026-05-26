import httpx
from fastapi import HTTPException
from services.teams_service import _get_app_token

def upload_audit_file_to_sharepoint(
    tenant_id: str,
    client_id: str,
    client_secret: str,
    container_id: str,
    file_bytes: bytes,
    file_name: str,
    vessel_name: str,
    report_type: str
) -> str:
    # 1. Get Auth Token
    token = _get_app_token(tenant_id, client_id, client_secret)
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Drive ID for the Container
    drive_url = f"https://graph.microsoft.com/v1.0/storage/fileStorage/containers/{container_id}/drive"
    drive_resp = httpx.get(drive_url, headers=headers, timeout=30)
    
    if drive_resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Failed to get drive for container: {drive_resp.text}")
        
    drive_id = drive_resp.json().get("id")
    if not drive_id:
        raise HTTPException(status_code=500, detail="Drive ID not found in container response.")

    # 3. Sanitize folder and file names to prevent URL errors
    safe_vessel = "".join([c for c in vessel_name if c.isalnum() or c in ' _-']).strip().replace(' ', '_')
    safe_type = "".join([c for c in report_type if c.isalnum() or c in ' _-']).strip().replace(' ', '_')
    safe_file = "".join([c for c in file_name if c.isalnum() or c in ' _-.']).strip().replace(' ', '_')

    # 4. Upload to SharePoint Embedded (Path: /audits/{vessel}/{type}/{filename})
    upload_url = f"https://graph.microsoft.com/v1.0/drives/{drive_id}/root:/audits/{safe_vessel}/{safe_type}/{safe_file}:/content"
    
    upload_resp = httpx.put(
        upload_url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/octet-stream"
        },
        content=file_bytes,
        timeout=120.0 # 2 minutes timeout for documents
    )

    if upload_resp.status_code not in (200, 201):
        raise HTTPException(status_code=400, detail=f"Failed to upload to SharePoint: {upload_resp.text}")

    # 5. Return the webUrl (This URL opens the document in Office Online / Browser PDF viewer)
    # 5. Return the Item ID (We save this in the DB to generate secure links later)
    item_id = upload_resp.json().get("id")
    if item_id:
        return item_id
    
    raise HTTPException(status_code=500, detail="Upload succeeded but no ID was returned.")