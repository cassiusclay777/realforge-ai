import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

/**
 * Pouze pro vývoj – vrací, které env proměnné jsou nastavené (ne hodnoty).
 * V produkci vrací 404. Mimo produkci vyžaduje přihlášeného uživatele s rolí ADMIN.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Není k dispozici" }, { status: 404 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Neautorizováno" }, { status: 401 })
  }

  return NextResponse.json({
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    DEEPSEEK_API_KEY: !!process.env.DEEPSEEK_API_KEY,
    REDIS_URL: !!process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV,
  })
}
