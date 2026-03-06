import httpx
import json
import base64
import os
from fastapi import HTTPException
from typing import Dict, Any

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"  # aktuální endpoint 2026

async def process_with_deepseek(listing: Dict[str, Any], photos: list[bytes]) -> Dict[str, Any]:
    if not DEEPSEEK_API_KEY:
        print("DeepSeek klíč chybí → fallback na mock")
        return fallback_mock(listing)

    # Omez fotky na 4–6 (token limit + cena)
    photo_b64 = [base64.b64encode(p).decode("utf-8") for p in photos[:6]]

    prompt = f"""
Jsi expert na realitní marketing v Česku. Analyzuj tyto fotky nemovitosti a data: 
Listing data: {json.dumps(listing, ensure_ascii=False, indent=2)}

Fotky (base64, pořadí důležité): {json.dumps(photo_b64)}

Vrať čistý JSON bez komentářů, úvodu nebo ```json:
{{
  "headline": "chytlavý titulek do inzerátu",
  "shortDesc": "2–3 věty shrnutí",
  "longDesc": "detailní popis 150–300 slov",
  "bulletPoints": ["5–8 silných bodů"],
  "seoTitle": "SEO titulek pro vyhledávače",
  "seoDescription": "meta popis 150 znaků",
  "priceSuggestion": číslo v Kč,
  "priceReasoning": "proč tato cena dává smysl",
  "targetAudience": "typický kupec",
  "instagramCaption": "text pro IG + 5–8 hashtagů",
  "facebookPost": "text pro FB post",
  "recommendations": ["3–5 tipů na prodej/zveřejnění"]
}}
"""

    payload = {
        "model": "deepseek-chat",           # nebo "deepseek-r1", "deepseek-vl" pokud máš vision
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 1800,
        "stream": False
    }

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(DEEPSEEK_URL, json=payload, headers=headers, timeout=90.0)
            r.raise_for_status()
            result = r.json()
            content = result["choices"][0]["message"]["content"].strip()

            # Čištění – DeepSeek někdy přidá ```json
            if content.startswith("```json"):
                content = content.split("```json")[1].split("```")[0].strip()

            parsed = json.loads(content)
            print("DeepSeek vrátil data:", parsed)
            return parsed

    except Exception as e:
        print(f"DeepSeek selhal: {str(e)} → fallback")
        return fallback_mock(listing)


def fallback_mock(listing: Dict[str, Any]) -> Dict[str, Any]:
    # Tvá původní simulace jako záloha
    return {
        "headline": f"Moderní {listing.get('type', 'nemovitost')} – {listing.get('address', 'lokalita')}",
        "shortDesc": "Skvělá příležitost k bydlení nebo investici.",
        "longDesc": "Detailní popis nemovitosti...",
        # ... doplň zbytek podle potřeby ...
    }