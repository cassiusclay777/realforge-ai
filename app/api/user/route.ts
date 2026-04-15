import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, role: true, phone: true, office: true },
    });
    if (user) {
      return NextResponse.json({
        ...user,
        phone: user.phone ?? null,
        office: user.office ?? null,
      });
    }
  } catch (error) {
    console.error("GET /api/user error:", error);
  }
  // Fallback: session exists but user not in DB or Prisma failed – return session data so form loads (phone/office only from DB)
  return NextResponse.json({
    id: session.user.id,
    name: session.user.name ?? "",
    email: (session.user as { email?: string }).email ?? "",
    image: session.user.image ?? null,
    role: (session.user as { role?: string }).role ?? "AGENT",
    phone: null,
    office: null,
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
    }
    const body = await request.json();
    const { name, email, phone, office } = body;
    const data: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      office?: string | null;
    } = {};
    if (typeof name === "string") data.name = name.trim() || null;
    if (typeof email === "string") data.email = email.trim() || null;
    if (typeof phone === "string") data.phone = phone.trim() || null;
    if (typeof office === "string") data.office = office.trim() || null;
    const user = await prisma.user.upsert({
      where: { id: session.user.id },
      create: {
        id: session.user.id,
        name: data.name ?? (session.user.name ?? null),
        email: data.email ?? (session.user as { email?: string }).email ?? null,
        role: (session.user as { role?: string }).role ?? "AGENT",
        ...data,
      },
      update: data,
      select: { id: true, name: true, email: true, image: true, role: true, phone: true, office: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("PATCH /api/user error:", error);
    return NextResponse.json(
      { error: "Chyba při ukládání profilu" },
      { status: 500 }
    );
  }
}
