/**
 * Vision přes Ollama (LLaVA, Llama 3.2 Vision) – lokální, open source, bez API klíčů.
 * Nastav OLLAMA_BASE_URL (nebo OLLAMA_HOST) a spusť např. ollama run llava.
 */

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? process.env.OLLAMA_HOST ?? 'http://localhost:11434';
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL ?? 'llava';

export interface OllamaChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
}

/**
 * Volá Ollama /api/chat s obrázkem (base64). Vrací text odpovědi.
 */
export async function chatWithImage(
  base64Image: string,
  prompt: string,
  options?: { model?: string; baseUrl?: string }
): Promise<string> {
  const base = (options?.baseUrl ?? OLLAMA_BASE).replace(/\/$/, '');
  const model = options?.model ?? OLLAMA_VISION_MODEL;

  const body = {
    model,
    stream: false,
    messages: [
      {
        role: 'user' as const,
        content: prompt,
        images: [base64Image],
      },
    ],
  };

  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const content = data.message?.content?.trim();
  if (!content) throw new Error('Empty Ollama response');
  return content;
}
