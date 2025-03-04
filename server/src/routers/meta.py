import json
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse
from src.schemas.metadata import Metadata

router = APIRouter()
META_DIR = Path(__file__).parent.parent.parent / "public" / "meta"


@router.get("/meta")
async def get_metadata() -> Metadata:
    with open(META_DIR / "metadata.json") as f:
        metadata = json.load(f)

    return Metadata(
        reporter=metadata["reporter"],
        message=metadata["message"],
        webLink=metadata["webLink"],
        privacyLink=metadata["privacyLink"],
        termsLink=metadata["termsLink"],
        brandColor=metadata["brandColor"],
    )


@router.get("/meta/reporter.png")
async def get_reporter_image():
    return FileResponse(META_DIR / "reporter.png")


@router.get("/meta/icon.png")
async def get_icon():
    return FileResponse(META_DIR / "icon.png")


@router.get("/meta/ogp.png")
async def get_ogp():
    return FileResponse(META_DIR / "ogp.png")


@router.get("/meta/metadata.json")
async def get_metadata_json():
    return FileResponse(META_DIR / "metadata.json")
