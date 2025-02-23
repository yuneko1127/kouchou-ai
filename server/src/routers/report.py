import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from src.schemas.report import Report, ReportStatus

router = APIRouter()


@router.get("/reports")
async def reports() -> list[Report]:
    # NOTE: 一旦固定値で実装
    return [
        Report(
            slug="example",
            title="[テスト]人類が人工知能を開発・展開する上で、最優先すべき課題は何でしょうか？",
            description="あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
            status=ReportStatus.READY,
        ),
    ]


@router.get("/reports/{slug}")
async def report(slug: str) -> dict:
    report_path = Path(__file__).parent.parent / "reports" / slug
    # NOTE: 実際のパスは、レポートの出力パスに合わせる。暫定的にサンプルのパスを指定
    report_result_path = report_path / "hierarchical_result.json"

    if not report_result_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")

    with open(report_result_path) as f:
        report_result = json.load(f)

    return report_result
