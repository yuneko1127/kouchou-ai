from enum import Enum

from src.schemas.base import SchemaBaseModel


class ReportStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class Report(SchemaBaseModel):
    slug: str
    title: str
    description: str
    status: ReportStatus
