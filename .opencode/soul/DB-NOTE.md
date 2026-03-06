# OpenCode DB (opencode.db) – Soul heartbeat

Soul heartbeat používá sqlite pro nedávné session/todos/transcript. Pokud je `db_unavailable`:

- **Workspace:** `opencode.db` v tomto projektu nebyl nalezen (`.opencode/opencode.db` ani v root).
- **Globální:** Zkontroluj `C:\Users\<USER>\.opencode\opencode.db` (nebo `~/.config/opencode/`). DB vytváří OpenCode/OpenWork při prvním běhu.

**Fix (Windows):**

1. Spusť OpenCode v tomto workspace alespoň jednou (jedna konverzace) – může vytvořit DB v workspace nebo v user config.
2. Pokud DB existuje a soul-heartbeat nemá přístup:
   ```powershell
   icacls ".opencode\opencode.db" /grant "%USERNAME%:F" /T
   ```
3. Nebo smaž a nech engine znovu vytvořit:
   ```powershell
   Remove-Item .opencode\opencode.db* -Force -ErrorAction SilentlyContinue
   ```

Potom znovu spusť `/soul-heartbeat` – měl by zmizet `db_unavailable` (pokud engine DB vytvořil na cestě, kterou agent vidí).
