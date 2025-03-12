import logging
import os
import sys

import structlog
from structlog.types import Processor


def setup_logger(
    log_level: str | None = None,
    json_logs: bool = False,
    log_file: str | None = None,
) -> structlog.stdlib.BoundLogger:
    """
    Uvicornおよびアプリケーション全体で使用する一貫したロガーを設定する

    Args:
        log_level: ログレベル (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        json_logs: JSONフォーマットでログを出力するかどうか
        log_file: ログファイルのパス（指定しない場合は標準出力）

    Returns:
        設定されたstructlogロガーインスタンス
    """
    # 環境変数またはデフォルト値からログレベルを取得
    if log_level is None:
        log_level = os.environ.get("LOG_LEVEL", "INFO").upper()

    # ログレベル文字列を数値に変換
    level = getattr(logging, log_level)

    # ファイルにログ出力する場合はハンドラーを設定
    handlers = []
    if log_file:
        file_handler = logging.FileHandler(log_file)
        handlers.append(file_handler)
    else:
        # 標準出力への出力を確保
        stream_handler = logging.StreamHandler(sys.stdout)
        handlers.append(stream_handler)

    # 標準のPythonロギングを設定
    logging.basicConfig(
        level=level,
        format="%(message)s",
        handlers=handlers,
        force=True,  # 既存の設定を上書き
    )

    # FastAPIとUvicornのロガーレベルを設定
    # 注意: UvicornがすでにLoggerを設定している場合があるため、
    # force=True を使っても完全に上書きされない場合がある
    for logger_name in ["uvicorn", "uvicorn.access", "uvicorn.error", "fastapi"]:
        module_logger = logging.getLogger(logger_name)
        module_logger.setLevel(level)
        # 既存のハンドラーをクリアしない方が良い場合がある
        # ただし、重複出力を避けるためにプロパゲーションを無効にする
        module_logger.propagate = False
        
        # 独自のハンドラーを追加
        for handler in handlers:
            handler_exists = False
            for existing_handler in module_logger.handlers:
                if type(existing_handler) is type(handler):
                    handler_exists = True
                    break
            if not handler_exists:
                module_logger.addHandler(handler)

    # structlogのプロセッサーを設定
    processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    # JSON形式の出力を設定
    if json_logs:
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(
            structlog.dev.ConsoleRenderer(colors=True, exception_formatter=structlog.dev.plain_traceback)
        )

    # structlogを設定
    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # ロガーを返す
    logger = structlog.get_logger("app")
    logger.info("Logger setup complete", log_level=log_level, json_logs=json_logs)
    return logger
