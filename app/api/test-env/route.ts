import { NextResponse } from "next/server"

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 })
  }
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ? "[SET]" : "[NOT SET]",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "[NOT SET]",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
    NODE_ENV: process.env.NODE_ENV,
  })
}