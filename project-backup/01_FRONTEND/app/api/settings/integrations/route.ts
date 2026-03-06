import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

// Simulace databáze - v produkci použijte Prisma/PostgreSQL
let integrationConfig = {
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
  deepseekApiKeyConfigured: !!process.env.DEEPSEEK_API_KEY,
  lastTested: null as string | null,
  testStatus: null as "success" | "error" | "pending" | null,
  testMessage: null as string | null,
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }

    // Vracíme konfiguraci bez skutečného API klíče pro bezpečnost
    const safeConfig = {
      deepseekApiKeyConfigured: integrationConfig.deepseekApiKeyConfigured,
      lastTested: integrationConfig.lastTested,
      testStatus: integrationConfig.testStatus,
      testMessage: integrationConfig.testMessage,
    };

    return NextResponse.json(safeConfig);
  } catch (error) {
    console.error("Chyba při načítání konfigurace integrací:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { deepseekApiKey } = body;

    if (!deepseekApiKey || typeof deepseekApiKey !== "string") {
      return NextResponse.json(
        { error: "Neplatný API klíč" },
        { status: 400 }
      );
    }

    // Uložení API klíče - v produkci by se měl šifrovat a ukládat do databáze
    integrationConfig.deepseekApiKey = deepseekApiKey;
    integrationConfig.deepseekApiKeyConfigured = true;

    // V produkci bychom zde mohli aktualizovat environment variable nebo databázi
    console.log("API klíč byl aktualizován");

    // Vracíme aktualizovanou konfiguraci bez skutečného API klíče
    const safeConfig = {
      deepseekApiKeyConfigured: integrationConfig.deepseekApiKeyConfigured,
      lastTested: integrationConfig.lastTested,
      testStatus: integrationConfig.testStatus,
      testMessage: integrationConfig.testMessage,
    };

    return NextResponse.json(safeConfig);
  } catch (error) {
    console.error("Chyba při ukládání konfigurace integrací:", error);
    return NextResponse.json(
      { error: "Interní chyba serveru" },
      { status: 500 }
    );
  }
}