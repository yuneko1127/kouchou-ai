import logging
import sys

import structlog


def setup_logger():
    # ProcessorFormatter を作成。これは logging のハンドラに適用するフォーマッターです。
    processor_formatter = structlog.stdlib.ProcessorFormatter(
        processor=structlog.processors.JSONRenderer(),
        # logging の外部からのログ（例: FastAPIやuvicorn）の前処理チェーン
        foreign_pre_chain=[
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
        ],
    )

    # ルートロガーに対してハンドラを設定（stdout 出力）
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(processor_formatter)
    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(logging.INFO)

    # structlog の設定。logging のログ出力が ProcessorFormatter 経由で整形されるようにする。
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            # structlog のログ呼び出し時の前処理チェーン
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.format_exc_info,
            # 最終的な出力は logging ハンドラが担うので、ここでは noop
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # FastAPIやuvicornが使用するログのハンドラも上書き（必要に応じて）
    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(logger_name)
        logger.handlers = [handler]
        logger.propagate = True
