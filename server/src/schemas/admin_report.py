from src.schemas.base import SchemaBaseModel


class ReportInput(SchemaBaseModel):
    input: str
    question: str
    intro: str
    cluster_num: int
    mode: str
    prompt: str
