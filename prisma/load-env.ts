/**
 * tsx / seed nečte automaticky `.env.local` (na rozdíl od `next dev`).
 * Načti `.env`, pak `.env.local` (přepíše), aby sedělo DATABASE_URL s Dockerem.
 */
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env") })
config({ path: resolve(process.cwd(), ".env.local"), override: true })
