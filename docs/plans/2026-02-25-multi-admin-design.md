# Multi-Admin Allowlist Design

**Date:** 2026-02-25

## Goal

Replace the single-admin email check with a comma-separated allowlist stored in the `ADMIN_EMAILS` environment variable. Admins can be added or removed by editing the Vercel env var — no code changes needed.

---

## Change

### File touched

`src/proxy.ts` — one block replaced.

### Before

```typescript
if (user.email !== process.env.ADMIN_EMAIL) {
  return NextResponse.redirect(new URL("/403", request.url));
}
```

### After

```typescript
const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);
if (!allowedEmails.includes(user.email ?? "")) {
  return NextResponse.redirect(new URL("/403", request.url));
}
```

---

## Environment Variable

**Name:** `ADMIN_EMAILS` (plural — replaces `ADMIN_EMAIL`)

**Format:**
```
ADMIN_EMAILS=stanovets.eu@gmail.com,n.mihaylovv@gmail.com
```

Spaces around commas are fine — they are trimmed at runtime.

**Update process:** Vercel → Settings → Environment Variables → edit `ADMIN_EMAILS` → Redeploy.

---

## Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Spaces around commas | Trimmed via `.map(e => e.trim())` |
| Empty / missing env var | `filter(Boolean)` yields empty list → everyone gets 403 (safe fail) |
| `user.email` is null | Falls back to `""` — matches nothing |

---

## What Does NOT Change

- Auth flow (Google OAuth, Supabase, `/auth/callback`)
- All other proxy logic
- Any existing tests
