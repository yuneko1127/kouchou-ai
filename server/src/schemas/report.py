from enum import Enum

from src.schemas.base import SchemaBaseModel


class ReportStatus(Enum):
    PROGRESS = "progress"
    READY = "ready"
    ERROR = "error"


class Report(SchemaBaseModel):
    slug: str
    title: str
    description: str
    status: ReportStatus
