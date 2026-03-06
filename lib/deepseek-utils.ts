/**
 * Utility funkce pro DeepSeek API integraci
 * Bezpečné ukládání a načítání API klíče
 */

// Simulace databáze - v produkci použijte Prisma/PostgreSQL
let apiKeyStorage = {
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
  configured: !!process.env.DEEPSEEK_API_KEY,
  lastUpdated: null as string | null,
};

/**
 * Získání API klíče z bezpečného úložiště
 */
export function getDeepSeekApiKey(): string | null {
  // Nejprve zkontroluj environment variable
  if (process.env.DEEPSEEK_API_KEY) {
    return process.env.DEEPSEEK_API_KEY;
  }
  
  // Pak zkontroluj uložený klíč v paměti (v produkci by bylo v DB)
  if (apiKeyStorage.deepseekApiKey) {
    return apiKeyStorage.deepseekApiKey;
  }
  
  return null;
}

/**
 * Uložení API klíče do bezpečného úložiště
 */
export function saveDeepSeekApiKey(apiKey: string): boolean {
  try {
    // V produkci by se zde šifroval a ukládal do databáze
    apiKeyStorage.deepseekApiKey = apiKey;
    apiKeyStorage.configured = true;
    apiKeyStorage.lastUpdated = new Date().toISOString();
    
    // Logování (v produkci by se logovalo bezpečně)
    console.log("API klíč byl aktualizován");
    
    return true;
  } catch (error) {
    console.error("Chyba při ukládání API klíče:", error);
    return false;
  }
}

/**
 * Kontrola, zda je API klíč nakonfigurován
 */
export function isDeepSeekConfigured(): boolean {
  return apiKeyStorage.configured || !!process.env.DEEPSEEK_API_KEY;
}

/**
 * Testování připojení k DeepSeek API
 */
export async function testDeepSeekConnection(apiKey?: string): Promise<{
  success: boolean;
  message: string;
  model?: string;
  error?: string;
}> {
  const keyToTest = apiKey || getDeepSeekApiKey();
  
  if (!keyToTest) {
    return {
      success: false,
      message: "API klíč není nakonfigurován",
      error: "missing_api_key"
    };
  }

  try {
    // Testovací volání DeepSeek API - models endpoint
    const response = await fetch("https://api.deepseek.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${keyToTest}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `DeepSeek API error: ${response.status}`,
        error: errorText
      };
    }

    const data = await response.json();
    
    // Kontrola struktury odpovědi
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const availableModels = data.data.map((model: any) => model.id).join(", ");
      return {
        success: true,
        message: `Připojení k DeepSeek API úspěšné. Dostupné modely: ${availableModels}`,
        model: data.data[0]?.id || "unknown"
      };
    }

    return {
      success: true,
      message: "Připojení k DeepSeek API úspěšné",
      model: "deepseek-chat"
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Chyba při připojení k DeepSeek API: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * Generování textu pomocí DeepSeek API
 */
export async function generateTextWithDeepSeek(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<{
  success: boolean;
  text?: string;
  error?: string;
}> {
  const apiKey = getDeepSeekApiKey();
  
  if (!apiKey) {
    return {
      success: false,
      error: "API klíč není nakonfigurován"
    };
  }

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options?.model || "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `DeepSeek API error: ${response.status} - ${errorText}`
      };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    
    if (!text) {
      return {
        success: false,
        error: "Prázdná odpověď od API"
      };
    }

    return {
      success: true,
      text
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Chyba při volání DeepSeek API: ${error.message}`
    };
  }
}

/**
 * Analýza obrázku pomocí DeepSeek API
 * Poznámka: DeepSeek aktuálně nepodporuje image analysis přímo,
 * ale můžeme použít textový popis URL
 */
export async function analyzeImageWithDeepSeek(
  imageUrl: string,
  context?: string
): Promise<{
  success: boolean;
  analysis?: {
    description: string;
    categories: string[];
    tags: string[];
    suggestedTitle?: string;
    suggestedDescription?: string;
  };
  error?: string;
}> {
  const prompt = `Analyzuj obrázek nemovitosti na této URL: ${imageUrl}. ${context ? `Kontext: ${context}` : ''}
  
  Vrať odpověď jako JSON s následujícími poli:
  - description: detailní popis toho, co by na obrázku nemovitosti mohlo být
  - categories: pole kategorií (např. ["LIVING_ROOM", "KITCHEN", "BEDROOM", "BATHROOM", "FACADE", "ADVERTISEMENT"])
  - tags: pole tagů (např. ["modern", "bright", "spacious", "renovated"])
  - suggestedTitle: návrh titulku pro tento obrázek
  - suggestedDescription: návrh popisu pro tento obrázek`;

  const result = await generateTextWithDeepSeek(prompt, {
    maxTokens: 1500,
    temperature: 0.3,
  });

  if (!result.success || !result.text) {
    return {
      success: false,
      error: result.error
    };
  }

  try {
    // Pokus o parsování JSON z odpovědi
    const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/) || 
                     result.text.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonText = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
      const analysis = JSON.parse(jsonText);
      
      return {
        success: true,
        analysis
      };
    }
    
    // Fallback: vrátíme text jako popis
    return {
      success: true,
      analysis: {
        description: result.text,
        categories: ["UNKNOWN"],
        tags: ["real_estate"],
        suggestedTitle: "Nemovitost",
        suggestedDescription: result.text.substring(0, 200) + "..."
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Chyba při parsování odpovědi: ${error.message}`
    };
  }
}

/**
 * Získání informací o stavu API
 */
export function getApiStatus() {
  return {
    configured: isDeepSeekConfigured(),
    lastUpdated: apiKeyStorage.lastUpdated,
    hasEnvKey: !!process.env.DEEPSEEK_API_KEY,
    hasStoredKey: !!apiKeyStorage.deepseekApiKey,
  };
}