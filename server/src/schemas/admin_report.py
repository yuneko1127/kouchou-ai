from src.schemas.base import SchemaBaseModel


class Comment(SchemaBaseModel):
    id: str
    body: str


class ReportInput(SchemaBaseModel):
    input: str  # レポートのID
    question: str  # レポートのタイトル
    intro: str  # レポートの調査概要
    cluster_num: int  # クラスタの層数
    model: str  # 利用するLLMの名称
    prompt: str  # プロンプト
    comments: list[Comment]  # コメントのリスト
