from src.schemas.base import SchemaBaseModel


class Metadata(SchemaBaseModel):
    reporter: str
    message: str
    webLink: str | None = None
    privacyLink: str | None = None
    termsLink: str | None = None
    brandColor: str | None = None
