/**
 * Spustí příkaz s načteným `.env` + `.env.local` (stejně jako seed).
 * Použití: npx tsx scripts/run-with-local-env.ts prisma migrate deploy
 */
import { config } from "dotenv"
import { spawnSync } from "node:child_process"
import { resolve } from "node:path"

config({ path: resolve(process.cwd(), ".env") })
config({ path: resolve(process.cwd(), ".env.local"), override: true })

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error("Usage: npx tsx scripts/run-with-local-env.ts <command> [args...]")
  process.exit(1)
}

const r = spawnSync(args[0], args.slice(1), {
  stdio: "inherit",
  shell: true,
  env: process.env,
})

process.exit(r.status ?? 1)
