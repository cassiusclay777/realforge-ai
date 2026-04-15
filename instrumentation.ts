/**
 * Při lokálním `next dev` jednou zkusí vytvořit/aktualizovat demo účet (stejné jako `npm run db:seed`).
 * Na Vercelu / v produkci se nespouští.
 */
export async function register() {
  if (process.env.VERCEL) return
  if (process.env.NODE_ENV !== "development") return
  if (process.env.DEMO_AUTO_SEED === "0") return

  try {
    const { ensureDemoUser } = await import("@/lib/ensure-demo-user")
    const { email } = await ensureDemoUser()
    console.info(`[instrumentation] Demo účet připraven: ${email}`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn(
      `[instrumentation] Demo seed přeskočen (běží DB a migrace?): ${msg}`
    )
  }
}
