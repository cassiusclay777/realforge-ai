/**
 * Vision pro kategorii + popisek: nejdřív Ollama (open source, lokálně), pak DeepSeek.
 * Nastav OLLAMA_BASE_URL (nebo OLLAMA_HOST) a „ollama run llava“ pro použití zdarma.
 */

import { chatWithImage } from './ollama-vision';

const DEFAULT_BASE = process.env.DEEPSEEK_API_URL ?? 'https://api.deepseek.com';

const ZIP_PROMPT = `Jsi expert na realitní fotografie. Pro přiloženou fotografii nemovitosti:
1. Urči přesně kategorii místnosti/prostoru (pouze jedna z: kuchyň, obývák, ložnice, koupelna, exteriér, zahrada, garáž, chodba, pracovna).
2. Napiš konkrétní popisek (2–4 věty) podle toho, co na fotce skutečně vidíš: místnost, nábytek, materiály, barvy, světlo. Žádné obecné fráze.
Vrať pouze validní JSON: {"kategorie": "string", "popisek": "string"}`;

const ALLOWED_CATEGORIES = ['kuchyň', 'obývák', 'ložnice', 'koupelna', 'exteriér', 'zahrada', 'garáž', 'chodba', 'pracovna'] as const;

function normalizeCategory(raw: string): string {
  const lower = raw.trim().toLowerCase();
  const match = ALLOWED_CATEGORIES.find(c => c === lower || c === lower.replace(/e$/, 'ěr'));
  return match ?? 'ostatní';
}

export interface VisionZipResult {
  kategorie: string;
  popisek: string;
}

/**
 * Vision: nejdřív Ollama (pokud je OLLAMA_BASE_URL nebo OLLAMA_HOST), jinak DeepSeek.
 * Ollama = zdarma, lokálně (ollama run llava). DeepSeek = placený API.
 */
export async function analyzeImageForZip(
  base64Image: string,
  comment: string,
  options?: { apiKey?: string; baseURL?: string }
): Promise<VisionZipResult> {
  const ollamaBase = process.env.OLLAMA_BASE_URL ?? process.env.OLLAMA_HOST;

  if (ollamaBase) {
    try {
      const prompt = comment.trim()
        ? `${ZIP_PROMPT}\nKomentář k nemovitosti (můžeš zohlednit): "${comment}".\n\nVrať pouze JSON, žádný jiný text.`
        : ZIP_PROMPT + '\n\nVrať pouze JSON, žádný jiný text.';
      const text = await chatWithImage(base64Image, prompt);
      return parseVisionResponse(text);
    } catch (e) {
      console.warn('Ollama vision failed, falling back to DeepSeek if configured:', e);
    }
  }

  const apiKey = options?.apiKey ?? process.env.DEEPSEEK_API_KEY;
  const base = (options?.baseURL ?? DEFAULT_BASE).replace(/\/$/, '');

  if (!apiKey) throw new Error('Pro vision nastav OLLAMA_BASE_URL (např. http://localhost:11434) a spusť ollama run llava, nebo DEEPSEEK_API_KEY.');

  const prompt = comment.trim()
    ? `${ZIP_PROMPT}\nKomentář k nemovitosti (můžeš zohlednit): "${comment}".`
    : ZIP_PROMPT;
  const userContent = prompt + '\n\nVrať pouze JSON, žádný jiný text.';

  // Oficiální DeepSeek API: POST /v1/chat/completions (OpenAI-kompatibilní), obrázek v content jako image_url
  const body = {
    model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
    messages: [
      {
        role: 'system' as const,
        content: 'Jsi expert na realitní fotografie. Odpovídej vždy pouze validním JSON bez markdown.',
      },
      {
        role: 'user' as const,
        content: [
          {
            type: 'image_url' as const,
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
          { type: 'text' as const, text: userContent },
        ],
      },
    ],
    max_tokens: 500,
    response_format: { type: 'json_object' as const },
  };

  const res = await fetch(`${base}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek Vision ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as Record<string, unknown>;
  let raw: string | undefined;
  if (Array.isArray(data.choices) && data.choices[0]) {
    const msg = (data.choices[0] as { message?: { content?: string } }).message;
    raw = msg?.content;
  } else {
    raw = (data.output ?? data.result ?? data.content) as string | undefined;
  }

  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) throw new Error('Empty vision response');
  return parseVisionResponse(text);
}

function parseVisionResponse(text: string): VisionZipResult {
  const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const parsed = JSON.parse(stripped) as { kategorie?: string; popisek?: string };
  const kategorie = normalizeCategory(parsed.kategorie ?? '');
  const popisek =
    typeof parsed.popisek === 'string' && parsed.popisek.trim().length > 0
      ? parsed.popisek.trim()
      : 'Fotografie nemovitosti.';
  return { kategorie, popisek };
}
