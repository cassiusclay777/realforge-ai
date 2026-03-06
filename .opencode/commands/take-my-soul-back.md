---
description: Revert Soul Mode (remove scheduler job and all Soul files)
agent: soul
---

You are running full revert of Soul Mode.

Steps (inform user; if you have permission to delete/schedule, do it; otherwise output exact checklist):

1) Delete scheduler job named `soul-heartbeat` (use scheduler delete_job or document for user).
2) Remove Soul Mode files:
   - `.opencode/soul.md`
   - `.opencode/soul/` (directory and contents, e.g. heartbeat.jsonl)
   - `.opencode/agents/soul.md`
   - `.opencode/commands/soul-heartbeat.md`
   - `.opencode/commands/soul-status.md`
   - `.opencode/commands/steer-soul.md`
   - `.opencode/commands/take-my-soul-back.md`
3) Revert `opencode.jsonc` (or `opencode.json`):
   - Remove `.opencode/soul.md` from `instructions` (if present).
   - Remove `opencode-scheduler` plugin only if it was added solely for Soul Mode.

Output a short confirmation: "Soul Mode reverted. Removed: [list]. Config reverted: [yes/no]."
