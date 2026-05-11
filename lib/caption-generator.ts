/**
 * Generování krátkého popisku (caption / alt text) pro fotku nemovitosti přes DeepSeek Vision.
 * Používá se po zpracování ZIPu a v API route generate-captions.
 */

import fs from 'fs/promises';
import path from 'path';

const CAPTION_PROMPT = `Jsi realitní fotograf. Popiš tuto fotku nemovitosti v 1-2 větách česky. Zaměř se na místnost, stav, světlo a klíčové prvky. Max 120 znaků. Odpověz pouze textem popisku, nic jiného.`;

const MAX_CAPTION_LENGTH = 120;
const MAX_IMAGE_SIZE_PX = 800;
const DEFAULT_BASE = (process.env.DEEPSEEK_API_URL ?? 'https://api.deepseek.com').replace(/\/$/, '');

export interface GenerateCaptionOptions {
  apiKey?: string;
  baseURL?: string;
  /** Max počet opakování při selhání (default 2) */
  maxRetries?: number;
}

/**
 * Zmenší obrázek na max 800px (delší strana) pomocí sharp. Vrací base64.
 */
async function resizeToBase64(imagePath: string): Promise<string> {
  try {
    const sharp = (await import('sharp')).default;
    const buf = await fs.readFile(imagePath);
    const resized = await sharp(buf)
      .resize(MAX_IMAGE_SIZE_PX, MAX_IMAGE_SIZE_PX, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return resized.toString('base64');
  } catch {
    const buf = await fs.readFile(imagePath);
    return buf.toString('base64');
  }
}

/**
 * Vygeneruje caption pro jednu fotku. Při selhání vrací null (nesmí zablokovat celý batch).
 */
export async function generatePhotoCaption(
  imagePathOrBase64: string,
  options?: GenerateCaptionOptions
): Promise<string | null> {
  const apiKey = options?.apiKey ?? process.env.DEEPSEEK_API_KEY;
  const base = (options?.baseURL ?? DEFAULT_BASE).replace(/\/$/, '');
  const maxRetries = options?.maxRetries ?? 2;

  if (!apiKey) return null;

  let base64Image: string;
  if (imagePathOrBase64.startsWith('data:') || imagePathOrBase64.length > 500) {
    base64Image = imagePathOrBase64.replace(/^data:image\/\w+;base64,/, '');
  } else {
    const fullPath = path.isAbsolute(imagePathOrBase64)
      ? imagePathOrBase64
      : path.join(process.cwd(), 'public', imagePathOrBase64.replace(/^\//, ''));
    try {
      base64Image = await resizeToBase64(fullPath);
    } catch (e) {
      console.warn('Caption: failed to read/resize image', fullPath, e);
      return null;
    }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const body = {
        model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
        messages: [
          {
            role: 'user' as const,
            content: [
              {
                type: 'image_url' as const,
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              },
              { type: 'text' as const, text: CAPTION_PROMPT },
            ],
          },
        ],
        max_tokens: 150,
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
        throw new Error(`DeepSeek ${res.status}: ${errText}`);
      }

      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const raw =
        data.choices?.[0]?.message?.content?.trim() ??
        (data as Record<string, unknown>).output ??
        (data as Record<string, unknown>).result ??
        '';
      const caption = typeof raw === 'string' ? raw.trim() : String(raw).trim();
      if (!caption) return null;
      return caption.slice(0, MAX_CAPTION_LENGTH);
    } catch (e) {
      console.warn(`Caption attempt ${attempt}/${maxRetries} failed:`, e);
      if (attempt === maxRetries) return null;
    }
  }
  return null;
}
