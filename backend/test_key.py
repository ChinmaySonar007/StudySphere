import os
from google import genai
from app.core.config import settings

api_key = settings.GOOGLE_API_KEY
print(f"Testing API key (len={len(api_key)}): {api_key[:10]}...")

client = genai.Client(api_key=api_key)

models_to_test = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash", "gemini-pro"]

for m in models_to_test:
    try:
        print(f"\n--- Testing model: {m} ---")
        res = client.models.generate_content(
            model=m,
            contents="Say hello in 5 words."
        )
        print(f"SUCCESS [{m}]:", res.text)
        break
    except Exception as e:
        print(f"ERROR [{m}]:", type(e), e)
