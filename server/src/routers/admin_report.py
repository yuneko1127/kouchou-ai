
from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.responses import ORJSONResponse
from fastapi.security.api_key import APIKeyHeader

from src.config import settings
from src.schemas.admin_report import ReportInput
from src.schemas.report import Report

router = APIRouter()


api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)):
    if not api_key or api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key


@router.get("/admin/reports")
async def get_reports(api_key: str = Depends(verify_api_key)) -> list[Report]:
    sample_reports = [
        {
            "slug": "example",
            "status": "ready",
            "title": "[テスト]人類が人工知能を開発・展開する上で、最優先すべき課題は何でしょうか？",
            "description": "あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
        },
        {
            "slug": "example_2",
            "status": "processing",
            "title": "[テスト]出力中のレポート",
            "description": "テストです",
        },
    ]
    sample_reports = [Report(**report) for report in sample_reports]
    return sample_reports


@router.post("/admin/reports")
async def create_report(report: ReportInput, api_key: str = Depends(verify_api_key)):
    print(report)  # コンソールに出力
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
