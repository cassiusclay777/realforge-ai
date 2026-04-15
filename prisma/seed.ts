import "./load-env"
import { ensureDemoUser } from "../lib/ensure-demo-user"

async function main() {
  const { email, created } = await ensureDemoUser()
  console.log(
    `[seed] Demo účet ${created ? "vytvořen" : "aktualizován"}: ${email} (heslo z DEMO_PASSWORD nebo výchozí demo12345)`
  )
}

main().catch((e) => {
  console.error("[seed]", e)
  const msg = e instanceof Error ? e.message : String(e)
  const code =
    e && typeof e === "object" && "code" in e ? String((e as { code?: string }).code) : ""

  if (code === "P2021" || msg.includes("does not exist")) {
    console.error(`
[seed] V databázi nejsou tabulky (Prisma migrace). Spusť:
  npx prisma migrate deploy
  npm run db:seed
`)
  }
  if (msg.includes("Authentication failed") || msg.includes("credentials")) {
    console.error(`
[seed] Postgres odmítl přihlášení. Zkontroluj:
  • DATABASE_URL v .env.local (uživatel, heslo, port — Docker mapuje často 5433→5432).
  • POSTGRES_PASSWORD v .env.local musí být stejné jako heslo v DATABASE_URL.
  • Kontejner vznikl se starým heslem? Zkus: docker-compose down -v && docker-compose up -d postgres
    (smaže data v DB!) nebo změň heslo v Postgresu tak, aby sedělo k .env.local.
`)
  }
  process.exit(1)
})
