from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_KEY: str = Field(env="API_KEY")

    class Config:
        env_file = ".env"


settings = Settings()
