from pathlib import Path
from typing import Literal
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
ROOT = Path(__file__).resolve().parents[2]
class Settings(BaseSettings):
    generation_provider: Literal["ollama", "groq"] = "ollama"
    groq_api_key: SecretStr = SecretStr("")
    groq_model: str = "qwen/qwen3.8-27b"
    ollama_host: str = "http://127.0.0.1:11434"
    ollama_model: str = "qwen2.5:1.5b"
    frontend_origin: str = "http://127.0.0.1:8000"
    model_config = SettingsConfigDict(env_file=ROOT / '.env', extra='ignore')
settings = Settings()
DATA = ROOT / 'data'
