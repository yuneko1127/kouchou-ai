from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from src.middleware.security_middleware import register_security_middleware
from src.routers import router
from src.services.report_status import load_status
from src.utils.logger import setup_logger

slogger = setup_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_status()
    yield


app = FastAPI(
    title="kouchou-ai API",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(
    router,
)

register_security_middleware(app)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # エラーの詳細とスタックトレースをログに出力
    slogger.error(f"Request URL: {request.url} - Exception: {exc}", exc_info=True)
    return ORJSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )
