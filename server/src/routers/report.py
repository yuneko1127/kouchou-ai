import json

from fastapi import APIRouter, HTTPException
from src.config import settings
from src.schemas.report import Report, ReportStatus
from src.services.report_status import load_status_as_reports

router = APIRouter()


@router.get("/reports")
async def reports() -> list[Report]:
    all_reports = load_status_as_reports()
    ready_reports = [report for report in all_reports if report.status == ReportStatus.READY]
    return ready_reports


@router.get("/reports/{slug}")
async def report(slug: str) -> dict:
    report_path = settings.REPORT_DIR / slug / "hierarchical_result.json"
    all_reports = load_status_as_reports()
    target_report_status = next((report for report in all_reports if report.slug == slug), None)

    if target_report_status is None:
        raise HTTPException(status_code=404, detail="Report not found")
    if target_report_status.status != ReportStatus.READY:
        raise HTTPException(status_code=404, detail="Report is not ready")
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")

    with open(report_path) as f:
        report_result = json.load(f)

    return report_result
