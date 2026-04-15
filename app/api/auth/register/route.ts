import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email: rawEmail, password: rawPassword } = body
    const email =
      typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : ""
    const displayName = typeof name === "string" ? name.trim() : ""
    const password = typeof rawPassword === "string" ? rawPassword : ""

    if (!displayName || !email || !password) {
      return NextResponse.json(
        { error: "Vyplňte jméno, e-mail a heslo." },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Heslo musí mít alespoň 8 znaků." },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Účet s tímto e-mailem už existuje." },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name: displayName,
          email,
          password: hashedPassword,
          role: "AGENT",
          emailVerified: new Date(),
        },
      })
      await tx.agent.create({
        data: {
          email: u.email!,
          name: u.name!,
          userId: u.id,
        },
      })
      return u
    })

    return NextResponse.json(
      {
        success: true,
        message: "Registrace proběhla v pořádku.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("Registration error:", error)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Účet s tímto e-mailem už existuje." },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Registrace se nezdařila. Zkontroluj databázi (DATABASE_URL) a migrace." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  )
}