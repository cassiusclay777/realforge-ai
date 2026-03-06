# Soul Mode heartbeat – process guidance and file queries

## How the heartbeat runs

1. **Command:** `.opencode/commands/soul-heartbeat.md` – defines the non-interactive check-in (read soul.md, optional sqlite, output summary + append one line to heartbeat.jsonl).
2. **Config:** `opencode.jsonc` – has `instructions: [".opencode/soul.md"]` and `plugin: ["opencode-scheduler"]`. No job definitions live here.
3. **Scheduled job:** Created only by the user in OpenCode (natural language or scheduler plugin). Stored by opencode-scheduler in `~/.config/opencode/scheduler/scopes/<workdir>/jobs/`, not in the repo.

## What the Soul agent can and cannot do

- **Can:** Read `.opencode/soul.md`, `.opencode/soul/heartbeat.jsonl`, `.opencode/soul/SCHEDULER.md`, this file; edit only `.opencode/soul.md`; run `pwd`, `sqlite3` (opencode.db), `cat`/append to heartbeat.jsonl; glob skills/commands.
- **Cannot:** Create or edit `opencode.json` / `opencode.jsonc`; write anywhere else. Do not suggest adding `scheduledJobs` to opencode.json – that key is not used by opencode-scheduler.

## Registering the soul-heartbeat job

The user must run this **in OpenCode** (in this workspace):

```
Schedule a job every 12 hours named soul-heartbeat to run the soul-heartbeat command with agent soul. Use timeout 120 seconds.
```

Then: **Run the soul-heartbeat job now** to confirm. Details: `.opencode/soul/SCHEDULER.md`.

## If asked “how to create the job”

Answer: “Job se nevytváří úpravou opencode.json. V OpenCode (v tomto workspace) napiš: *Schedule a job every 12 hours named soul-heartbeat to run the soul-heartbeat command with agent soul. Use timeout 120 seconds.* Podrobnosti jsou v `.opencode/soul/SCHEDULER.md`.”
