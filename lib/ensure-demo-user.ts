import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const DEFAULT_EMAIL = "demo@realforge.ai"
const DEFAULT_PASSWORD = "demo12345"
const DEFAULT_NAME = "Demo makléř"

/**
 * Idempotentní vývojový účet (credentials). Volá se z prisma seed a z instrumentation ve vývoji.
 * Heslo: DEMO_PASSWORD v .env (min. 8 znaků), jinak DEFAULT_PASSWORD.
 */
export async function ensureDemoUser(): Promise<{ email: string; created: boolean }> {
  const email = (process.env.DEMO_EMAIL || DEFAULT_EMAIL).trim().toLowerCase()
  const envPw = process.env.DEMO_PASSWORD
  let passwordPlain = envPw || DEFAULT_PASSWORD
  if (passwordPlain.length < 8) {
    if (envPw !== undefined && envPw.length > 0) {
      console.warn(
        `[ensure-demo-user] DEMO_PASSWORD musí mít aspoň 8 znaků — používám výchozí "${DEFAULT_PASSWORD}"`
      )
    }
    passwordPlain = DEFAULT_PASSWORD
  }
  const name = (process.env.DEMO_USER_NAME || DEFAULT_NAME).trim() || DEFAULT_NAME
  const hashed = await bcrypt.hash(passwordPlain, 12)

  const created = await prisma.$transaction(async (tx) => {
    const existed = await tx.user.findUnique({
      where: { email },
      select: { id: true },
    })

    const user = await tx.user.upsert({
      where: { email },
      create: {
        email,
        name,
        password: hashed,
        role: "AGENT",
        emailVerified: new Date(),
      },
      update: {
        password: hashed,
        name,
        emailVerified: new Date(),
      },
      select: { id: true },
    })

    await tx.agent.upsert({
      where: { email },
      create: {
        email,
        name,
        userId: user.id,
      },
      update: {
        name,
        userId: user.id,
      },
    })

    return !existed
  })

  return { email, created }
}
