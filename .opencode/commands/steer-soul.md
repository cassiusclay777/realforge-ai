---
description: Soul Mode steering (interactive – update focus, preferences, cadence)
agent: soul
---

You are running Soul Mode steering (interactive).

- If the user gives explicit values (e.g. new current focus, tone preference, heartbeat cadence), apply them:
  - Update `.opencode/soul.md` sections: Current focus, Preferences, or add a note under Recurring chores.
  - If cadence changes (e.g. every 6h instead of 12h), tell the user to update the scheduler job `soul-heartbeat` (e.g. cron `0 */6 * * *`) – you cannot edit scheduler config here.
- If the user is vague, ask one short clarifying question.
- After any edit, summarize exactly what changed (e.g. "Updated Current focus to: …"; "Preferences: added …").

Always end with a one-line summary of what changed, or "No changes made."
