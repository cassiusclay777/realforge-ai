import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

// Simulace databáze - stejná jako v integrations route
let integrationConfig = {
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
  deepseekApiKeyConfigured: !!process.env.DEEPSEEK_API_KEY,
  lastTested: null as string | null,
  testStatus: null as "success" | "error" | "pending" | null,
  testMessage: null as string | null,
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }

    // Získání API klíče z konfigurace
    const apiKey = integrationConfig.deepseekApiKey || process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      integrationConfig.lastTested = new Date().toISOString();
      integrationConfig.testStatus = "error";
      integrationConfig.testMessage = "API klíč není nakonfigurován";

      return NextResponse.json(
        { 
          error: "API klíč není nakonfigurován",
          message: "Prosím nakonfigurujte DeepSeek API klíč v nastavení integrací"
        },
        { status: 400 }
      );
    }

    // Testování připojení k DeepSeek API
    try {
      const testResponse = await testDeepSeekConnection(apiKey);
      
      integrationConfig.lastTested = new Date().toISOString();
      integrationConfig.testStatus = "success";
      integrationConfig.testMessage = testResponse.message;

      return NextResponse.json({
        success: true,
        message: testResponse.message,
        model: testResponse.model,
        status: "connected"
      });
    } catch (error: any) {
      integrationConfig.lastTested = new Date().toISOString();
      integrationConfig.testStatus = "error";
      integrationConfig.testMessage = error.message || "Chyba při připojení k API";

      return NextResponse.json(
        { 
          error: "Chyba při připojení k DeepSeek API",
          message: error.message || "Nepodařilo se připojit k DeepSeek API"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chyba při testování AI připojení:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru" },
      { status: 500 }
    );
  }
}

async function testDeepSeekConnection(apiKey: string) {
  // Testovací volání DeepSeek API - používáme models endpoint pro test
  const response = await fetch("https://api.deepseek.com/v1/models", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Kontrola, zda API vrací seznam modelů
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
}