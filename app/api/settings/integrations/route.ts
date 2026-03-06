import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encryptApiKey } from "@/lib/encryption";

const INTEGRATION_NAMES = ["DEEPSEEK", "SREALITY", "POSKI"] as const;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }

    const integrations = await prisma.integration.findMany({
      where: {
        userId: session.user.id,
        name: { in: [...INTEGRATION_NAMES] },
      },
      select: {
        name: true,
        apiKey: true,
        srealityApiKey: true,
        poskiApiKey: true,
        config: true,
      },
    });

    const byName = Object.fromEntries(
      integrations.map((i) => [i.name, i])
    );

    const deepseek = byName.DEEPSEEK;
    const deepseekConfig = (deepseek?.config as Record<string, unknown>) ?? {};
    const safeConfig = {
      deepseekApiKeyConfigured: !!deepseek?.apiKey,
      srealityApiKeyConfigured: !!byName.SREALITY?.srealityApiKey,
      poskiApiKeyConfigured: !!byName.POSKI?.poskiApiKey,
      lastTested: (deepseekConfig.lastTested as string) ?? null,
      testStatus: (deepseekConfig.testStatus as string) ?? null,
      testMessage: (deepseekConfig.testMessage as string) ?? null,
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

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const type = (body.type ?? "DEEPSEEK") as string;
    const apiKeyRaw = body.apiKey ?? body.deepseekApiKey;

    if (!apiKeyRaw || typeof apiKeyRaw !== "string") {
      return NextResponse.json(
        { error: "Neplatný API klíč" },
        { status: 400 }
      );
    }

    const trimmed = apiKeyRaw.trim();
    const name = INTEGRATION_NAMES.includes(type as (typeof INTEGRATION_NAMES)[number])
      ? type
      : "DEEPSEEK";

    if (name === "SREALITY") {
      const encrypted = encryptApiKey(trimmed);
      await prisma.integration.upsert({
        where: {
          userId_name: { userId: session.user.id, name: "SREALITY" },
        },
        create: {
          userId: session.user.id,
          name: "SREALITY",
          srealityApiKey: encrypted,
          enabled: true,
        },
        update: { srealityApiKey: encrypted, updatedAt: new Date() },
      });
    } else if (name === "POSKI") {
      const encrypted = encryptApiKey(trimmed);
      await prisma.integration.upsert({
        where: {
          userId_name: { userId: session.user.id, name: "POSKI" },
        },
        create: {
          userId: session.user.id,
          name: "POSKI",
          poskiApiKey: encrypted,
          enabled: true,
        },
        update: { poskiApiKey: encrypted, updatedAt: new Date() },
      });
    } else {
      // DEEPSEEK – šifruj do DB při uložení z UI; worker má fallback na .env
      const encrypted = encryptApiKey(trimmed);
      await prisma.integration.upsert({
        where: {
          userId_name: { userId: session.user.id, name: "DEEPSEEK" },
        },
        create: {
          userId: session.user.id,
          name: "DEEPSEEK",
          apiKey: encrypted,
          enabled: true,
        },
        update: { apiKey: encrypted, updatedAt: new Date() },
      });
    }

    const integrations = await prisma.integration.findMany({
      where: {
        userId: session.user.id,
        name: { in: [...INTEGRATION_NAMES] },
      },
      select: {
        name: true,
        apiKey: true,
        srealityApiKey: true,
        poskiApiKey: true,
        config: true,
      },
    });

    const byName = Object.fromEntries(integrations.map((i) => [i.name, i])) as Record<string, { config?: Record<string, unknown>; apiKey?: string | null; srealityApiKey?: string | null; poskiApiKey?: string | null }>;
    const deepseekConfig = byName.DEEPSEEK?.config ?? {};
    const safeConfig = {
      deepseekApiKeyConfigured: !!byName.DEEPSEEK?.apiKey,
      srealityApiKeyConfigured: !!byName.SREALITY?.srealityApiKey,
      poskiApiKeyConfigured: !!byName.POSKI?.poskiApiKey,
      lastTested: deepseekConfig.lastTested ?? null,
      testStatus: deepseekConfig.testStatus ?? null,
      testMessage: deepseekConfig.testMessage ?? null,
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
