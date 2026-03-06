---
description: Soul Mode status (read-only)
agent: soul
---

You are running Soul Mode status (read-only).

Steps:
1) Read `.opencode/soul.md` – report Current focus, Loose ends, Last updated.
2) Read `.opencode/soul/heartbeat.jsonl` – show latest 3–5 entries (last line = most recent); report heartbeat age.
3) If scheduler state is readable (e.g. from config or job list), report next scheduled run for soul-heartbeat.

Output:
- Current focus (from soul.md).
- Latest heartbeat age and last summary.
- Top loose ends.
- Next action (from latest heartbeat or soul.md).
- Next scheduled heartbeat (if known).

No edits; no destructive actions.
