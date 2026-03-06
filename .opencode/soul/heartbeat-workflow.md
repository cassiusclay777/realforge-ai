# Soul Mode heartbeat – workflow guidelines and DB steps

## When read fails (degraded mode)

- If `Read .opencode/soul.md` or other allowed paths are blocked (e.g. path pattern mismatch), **do not stop**.
- Use **soul.md content from instructions** if the runner loads `.opencode/soul.md` into context; otherwise use the **last known** Current focus, Loose ends, and Recurring chores from previous heartbeat output or this file.
- Proceed with: workspace path (pwd), DB attempt, then build summary/loose_ends/next_action/improvements from that context, and **always append one JSON line** to `.opencode/soul/heartbeat.jsonl`.

## DB steps

1. **Resolve workspace path**  
   Run `pwd` (or use workspace root). Normalize for SQL: e.g. `C:\Users\Patri\REALFORGE-AI` or `/c/Users/Patri/REALFORGE-AI`. Use this as `<pwd>` in queries.

2. **Locate opencode.db**  
   Try in order:
   - Workspace: `.opencode/opencode.db` (relative to project root).
   - Global: `~/.config/opencode/opencode.db` or Windows `%USERPROFILE%\.config\opencode\opencode.db`, or `C:\Users\<USER>\.opencode\opencode.db`.

3. **Query only if DB exists and is readable**  
   - Recent sessions:  
     `SELECT id, title, time_updated FROM session WHERE directory = '<pwd>' ORDER BY time_updated DESC LIMIT 8;`
   - Open todos:  
     `SELECT s.title, t.content, t.status, t.priority, t.time_updated FROM todo t JOIN session s ON s.id = t.session_id WHERE s.directory = '<pwd>' AND t.status != 'completed' ORDER BY t.time_updated DESC LIMIT 20;`
   - Recent transcript text:  
     `SELECT s.title, p.time_updated, json_extract(p.data, '$.text') AS text FROM part p JOIN message m ON m.id = p.message_id JOIN session s ON s.id = m.session_id WHERE s.directory = '<pwd>' AND json_extract(p.data, '$.type') = 'text' ORDER BY p.time_updated DESC LIMIT 60;`

4. **If DB fails**  
   - File not found → set `signals: "db_unavailable"` in the JSON line; continue.
   - `no such table: session` (or similar) → schema differs; set `signals: "db_schema_unknown"`; continue without session/todo/transcript data.
   - Never block the heartbeat: always output check-in and append one line.

## Timestamp (ISO-8601 for `ts`)

- Prefer: `sqlite3 :memory: "SELECT strftime('%Y-%m-%dT%H:%M:%SZ','now');"` (allowed via bash).
- Fallback: use approximate time from conversation context (e.g. "Today's date") or last known time; still append the line.

## Append step

- Use one of:
  - `cat >> .opencode/soul/heartbeat.jsonl <<'EOF'` + one JSON line + `EOF`
  - PowerShell: `Add-Content -Path .opencode/soul/heartbeat.jsonl -Value '<one JSON line>'`
- Required keys: `ts`, `workspace`, `summary`, `loose_ends` (array), `next_action`.
- Optional: `session_titles`, `open_todo_count`, `signals`, `improvements`.
