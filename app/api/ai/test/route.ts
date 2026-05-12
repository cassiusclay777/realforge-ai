import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDeepSeekApiKey } from "@/lib/integration-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
    }

    const apiKey = await getDeepSeekApiKey(session.user.id);

    if (!apiKey) {
      await saveTestResult(session.user.id, "error", "API klíč není nakonfigurován");
      return NextResponse.json(
        {
          error: "API klíč není nakonfigurován",
          message: "Prosím nakonfigurujte DeepSeek API klíč v nastavení integrací",
        },
        { status: 400 }
      );
    }

    try {
      const testResponse = await testDeepSeekConnection(apiKey);
      await saveTestResult(session.user.id, "success", testResponse.message);

      return NextResponse.json({
        success: true,
        message: testResponse.message,
        model: testResponse.model,
        status: "connected",
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Chyba při připojení k API";
      await saveTestResult(session.user.id, "error", msg);

      return NextResponse.json(
        {
          error: "Chyba při připojení k DeepSeek API",
          message: msg,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chyba při testování AI připojení:", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

async function saveTestResult(
  userId: string,
  status: "success" | "error",
  message: string
) {
  try {
    const now = new Date().toISOString();
    await prisma.integration.updateMany({
      where: { userId, name: "DEEPSEEK" },
      data: {
        config: { lastTested: now, testStatus: status, testMessage: message },
        updatedAt: new Date(),
      },
    });
  } catch {
    // Non-critical: if saving fails, don't break the test response
  }
}

async function testDeepSeekConnection(apiKey: string) {
  const response = await fetch("https://api.deepseek.com/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.data && Array.isArray(data.data) && data.data.length > 0) {
    const availableModels = data.data.map((model: { id: string }) => model.id).join(", ");
    return {
      success: true,
      message: `Připojení k DeepSeek API úspěšné. Dostupné modely: ${availableModels}`,
      model: data.data[0]?.id || "unknown",
    };
  }

  return {
    success: true,
    message: "Připojení k DeepSeek API úspěšné",
    model: "deepseek-chat",
  };
}
