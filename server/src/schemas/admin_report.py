from src.schemas.base import SchemaBaseModel


class Comment(SchemaBaseModel):
    id: str
    comment: str
    source: str | None = None
    url: str | None = None

    class Config:
        extra = "allow"


class Prompt(SchemaBaseModel):
    extraction: str
    initial_labelling: str
    merge_labelling: str
    overview: str


class ReportInput(SchemaBaseModel):
    input: str  # レポートのID
    question: str  # レポートのタイトル
    intro: str  # レポートの調査概要
    cluster: list[int]  # 層ごとのクラスタ数定義
    model: str  # 利用するLLMの名称
    workers: int  # LLM APIの並列実行数
    prompt: Prompt  # プロンプト
    comments: list[Comment]  # コメントのリスト
