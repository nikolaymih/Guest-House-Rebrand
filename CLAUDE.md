# Guest House Stanovets — Claude Instructions

## Worktree Setup

When creating a new git worktree, `.env.local` is **not** automatically available inside it.
After running `git worktree add .worktrees/<branch-name> -b <branch-name>`, symlink the env file:

```bash
ln -s ../../.env.local .worktrees/<branch-name>/.env.local
```

The path `../../.env.local` resolves to the project root from inside `.worktrees/<branch-name>/`.

> **Never copy** `.env.local` — a symlink ensures both the worktree and the main tree always use the same secrets.

## Admin Access

Admin emails are controlled by the `ADMIN_EMAILS` env var (comma-separated):

```
ADMIN_EMAILS=stanovets.eu@gmail.com,another@example.com
```

To add or remove an admin: edit this value in Vercel → Settings → Environment Variables → redeploy. No code changes needed.
