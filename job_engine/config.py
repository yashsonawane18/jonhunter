"""
Job Engine - Configuration & Keys (config.py)
"""

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent

# Gemini API Keys pool
GEMINI_API_KEYS = [
    k.strip() for k in os.getenv("GEMINI_API_KEYS", "").split(",") if k.strip()
]
# Fallback to single key if pool not configured
if not GEMINI_API_KEYS and os.getenv("GEMINI_API_KEY"):
    GEMINI_API_KEYS = [os.getenv("GEMINI_API_KEY").strip()]

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def call_gemini_with_key_failover(prompt: str, schema_cls=None, temperature: float = 0.2):
    """Executes a Gemini call with API key failover."""
    if not GEMINI_API_KEYS:
        return None

    try:
        from google import genai
        from google.genai import types

        for api_key in GEMINI_API_KEYS:
            try:
                client = genai.Client(api_key=api_key)
                config_kwargs = {"temperature": temperature}
                if schema_cls:
                    config_kwargs["response_mime_type"] = "application/json"
                    config_kwargs["response_schema"] = schema_cls

                response = client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(**config_kwargs) if config_kwargs else None
                )
                if response and response.text:
                    return response.text
            except Exception:
                continue
    except Exception:
        pass
    return None
