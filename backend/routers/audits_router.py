import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import re
import httpx
import models
import schemas
from database import get_db
from middlewares.auth_middleware import get_current_user
from services import audits_service

router = APIRouter(prefix="/audits", tags=["Audits"])

def format_size(size_bytes: int) -> str:
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.1f} MB"

@router.post("/upload", response_model=schemas.AuditReportResponse)
async def upload_audit_report(
    title: str = Form(...),
    report_type: str = Form(...),
    vessel: str = Form(...),
    vapt_category: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tenant_id = os.getenv("MS_TENANT_ID")
    client_id = os.getenv("MS_CLIENT_ID")
    client_secret = os.getenv("MS_CLIENT_SECRET")
    container_id = os.getenv("SHAREPOINT_CONTAINER_ID")

    if not all([tenant_id, client_id, client_secret, container_id]):
        raise HTTPException(status_code=500, detail="SharePoint credentials not configured in .env")

    file_bytes = await file.read()
    file_size = len(file_bytes)

    # 1. Upload to SharePoint
    web_url = audits_service.upload_audit_file_to_sharepoint(
        tenant_id=tenant_id,
        client_id=client_id,
        client_secret=client_secret,
        container_id=container_id,
        file_bytes=file_bytes,
        file_name=file.filename,
        vessel_name=vessel,
        report_type=report_type
    )

    # 2. Save to Database
    # Determine initial status based on type
    initial_status = "pending"
    if report_type == "vapt" and vapt_category == "technical":
        initial_status = "flagged" # Just an example based on your mock data

    report = models.AuditReport(
        title=title,
        report_type=report_type,
        vapt_category=vapt_category,
        vessel=vessel,
        file_name=file.filename,
        file_size_bytes=file_size,
        file_url=web_url,
        status=initial_status,
        uploaded_by_user_id=current_user.id
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Generate a string ID like "TR001" or "VA-OS-T" for the frontend
    prefix = report_type[:2].upper()
    display_id = f"{prefix}{report.id:03d}"

    return {
        "id": display_id,
        "title": report.title,
        "type": report.report_type,
        "vaptCategory": report.vapt_category,
        "vessel": report.vessel,
        "fileName": report.file_name,
        "fileSize": format_size(report.file_size_bytes),
        "fileUrl": report.file_url,
        "status": report.status,
        "uploadedBy": current_user.full_name or current_user.email,
        "uploadDate": report.upload_date.strftime("%Y-%m-%d")
    }

@router.get("/", response_model=list[schemas.AuditReportResponse])
def get_audit_reports(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    reports = db.query(models.AuditReport).order_by(models.AuditReport.upload_date.desc()).all()
    
    result = []
    for r in reports:
        prefix = r.report_type[:2].upper()
        display_id = f"{prefix}{r.id:03d}"
        
        result.append({
            "id": display_id,
            "title": r.title,
            "type": r.report_type,
            "vaptCategory": r.vapt_category,
            "vessel": r.vessel,
            "fileName": r.file_name,
            "fileSize": format_size(r.file_size_bytes),
            "fileUrl": r.file_url,
            "status": r.status,
            "uploadedBy": r.uploader.full_name or r.uploader.email,
            "uploadDate": r.upload_date.strftime("%Y-%m-%d")
        })
    return result

@router.put("/{report_id}/status")
def update_report_status(
    report_id: int, 
    status: str = Form(...), 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    report = db.query(models.AuditReport).filter(models.AuditReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.status = status
    db.commit()
    return {"message": "Status updated successfully"}

@router.delete("/{display_id}")
def delete_report(
    display_id: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Extract the real database ID from the display ID (e.g., "VA001" -> 1)
    real_id = int(re.sub(r'\D', '', display_id))
    report = db.query(models.AuditReport).filter(models.AuditReport.id == real_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}

@router.get("/{display_id}/links")
def get_report_links(
    display_id: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Extract the real database ID from the display ID (e.g., "VA001" -> 1)
        real_id = int(re.sub(r'\D', '', display_id))
        report = db.query(models.AuditReport).filter(models.AuditReport.id == real_id).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

        # Fallback for old reports uploaded before we made this change
        if "http" in report.file_url:
            return {
                "downloadUrl": report.file_url.replace("?action=default", "?download=1"),
                "viewUrl": report.file_url
            }

        tenant_id = os.getenv("MS_TENANT_ID")
        client_id = os.getenv("MS_CLIENT_ID")
        client_secret = os.getenv("MS_CLIENT_SECRET")
        container_id = os.getenv("SHAREPOINT_CONTAINER_ID")

        # 1. Get App-Only Token
        from services.teams_service import _get_app_token
        token = _get_app_token(tenant_id, client_id, client_secret)
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get the Download URL
        item_url = f"https://graph.microsoft.com/v1.0/drives/{container_id}/items/{report.file_url}"
        item_resp = httpx.get(item_url, headers=headers, timeout=15.0)
        
        if item_resp.status_code != 200:
            print(f"❌ Graph API Download Error: {item_resp.text}")
            raise HTTPException(status_code=500, detail="Failed to get download link from Microsoft")
            
        download_url = item_resp.json().get("@microsoft.graph.downloadUrl")

        # 3. Get the View (Preview) URL (Added json={} to prevent 411 errors)
        preview_url = f"https://graph.microsoft.com/v1.0/drives/{container_id}/items/{report.file_url}/preview"
        preview_resp = httpx.post(preview_url, headers=headers, json={}, timeout=15.0)
        
        if preview_resp.status_code not in (200, 201):
            print(f"⚠️ Graph API Preview Error: {preview_resp.text}")
            # If preview fails, fallback to the download URL so the user can still get the file
            view_url = download_url 
        else:
            view_url = preview_resp.json().get("getUrl")

        return {
            "downloadUrl": download_url,
            "viewUrl": view_url
        }
        
    except Exception as e:
        print(f"❌ Python Error in get_report_links: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))