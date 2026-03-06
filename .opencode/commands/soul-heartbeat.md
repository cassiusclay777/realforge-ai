---
description: Soul Mode heartbeat (non-interactive)
agent: soul
---

You are running Soul Mode heartbeat.

Constraints:
- Non-interactive: do not ask questions.
- Safe: no destructive actions.

**If read fails:** Use soul.md from instructions (if loaded) or last known context; read `.opencode/soul/heartbeat-workflow.md` for full DB steps and degraded mode. Always output check-in and append one JSON line.

Steps:
1) Read `.opencode/soul.md` (if blocked, use instruction context or `.opencode/soul/heartbeat-workflow.md`).
2) Read `AGENTS.md` (and `_repos/openwork/AGENTS.md` if present). Optional if blocked.
3) Get workspace path via `pwd` (or use workspace root). Use it as `<pwd>` in DB queries.
4) DB: See `.opencode/soul/heartbeat-workflow.md` for locations and queries. Try workspace `.opencode/opencode.db` then global `~/.config/opencode/opencode.db` (or Windows equivalent). If DB missing or "no such table", set `signals: "db_unavailable"` or `"db_schema_unknown"` and continue.
5) Timestamp: Prefer `sqlite3 :memory: "SELECT strftime('%Y-%m-%dT%H:%M:%SZ','now');"`. Fallback: approximate from context (e.g. today’s date).
6) Optionally refresh `.opencode/soul.md` (Loose ends / Recurring chores) when justified.
7) Output concise check-in: Summary (1 sentence), Loose ends (1-3), Next action (1), Improvements (2-3).
8) Append one JSON line to `.opencode/soul/heartbeat.jsonl`. Required keys: `ts`, `workspace`, `summary`, `loose_ends`, `next_action`. Optional: `session_titles`, `open_todo_count`, `signals`, `improvements`.

Append (bash): `cat >> .opencode/soul/heartbeat.jsonl <<'EOF'` then one JSON line then `EOF`.  
PowerShell: `Add-Content -Path .opencode/soul/heartbeat.jsonl -Value '<one JSON line>'`.
