# Soul heartbeat – scheduler setup

`opencode-scheduler` is enabled in `opencode.jsonc`. **Jobs are NOT defined in opencode.json / opencode.jsonc** – the plugin stores them in `~/.config/opencode/scheduler/` and creates them only when you run the sentence below in OpenCode.

Register the job once (in OpenCode, in this workspace) so the audit sees "soul-heartbeat job".

## Create the job (run in OpenCode in this workspace)

Say exactly:

```
Schedule a job every 12 hours named soul-heartbeat to run the soul-heartbeat command with agent soul. Use timeout 120 seconds.
```

Or shorter (plugin may infer name from command):

```
Schedule a job every 12 hours to run command soul-heartbeat with agent soul. Timeout 120 seconds.
```

Then: **Run the soul-heartbeat job now** (or run command `soul-heartbeat` with agent `soul`) to confirm and refresh "Recent heartbeat proof".

| Field | Value |
|-------|--------|
| **Name** | `soul-heartbeat` |
| **Command** | `soul-heartbeat` |
| **Agent** | `soul` |
| **Cadence** | `0 */12 * * *` (every 12 hours) |
| **Workdir** | workspace root (default) |
| **Timeout** | 120s |

- List jobs: **Show my scheduled jobs**
- Run now: **Run the soul-heartbeat job now**
- Revert: run command `take-my-soul-back`, then delete this file if desired.
