
from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.responses import ORJSONResponse
from fastapi.security.api_key import APIKeyHeader
from src.config import settings
from src.schemas.admin_report import ReportInput
from src.schemas.report import Report
from src.services.report_launcher import launch_report_generation
from src.services.report_status import load_status_as_reports

router = APIRouter()


api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)):
    if not api_key or api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key


@router.get("/admin/reports")
async def get_reports(api_key: str = Depends(verify_api_key)) -> list[Report]:
    return load_status_as_reports()


@router.post("/admin/reports")
async def create_report(report: ReportInput, api_key: str = Depends(verify_api_key)):
    launch_report_generation(report)
    return ORJSONResponse(
        content=None,
        headers={
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    )


@router.options("/admin/reports")
async def options_reports():
    return ORJSONResponse(
        content=None,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-api-key",
        },
    )
