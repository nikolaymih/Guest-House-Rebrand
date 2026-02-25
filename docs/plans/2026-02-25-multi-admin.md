# Multi-Admin Allowlist Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the single-admin email check in `proxy.ts` with a comma-separated allowlist read from `ADMIN_EMAILS`.

**Architecture:** Extract a pure `parseAdminEmails(envValue)` helper so the logic is unit-testable. `proxy.ts` calls the helper and checks `.includes(user.email)`. Env var format: `ADMIN_EMAILS=a@b.com,c@d.com`.

**Tech Stack:** Next.js 16, Vitest, TypeScript.

---

## Task 1: `parseAdminEmails` helper + tests (TDD)

**Files:**
- Create: `src/lib/utils/parseAdminEmails.ts`
- Create: `src/lib/utils/parseAdminEmails.test.ts`

**Step 1: Write the failing tests**

Create `src/lib/utils/parseAdminEmails.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseAdminEmails } from "./parseAdminEmails";

describe("parseAdminEmails", () => {
  it("returns list from comma-separated string", () => {
    expect(parseAdminEmails("a@b.com,c@d.com")).toEqual(["a@b.com", "c@d.com"]);
  });

  it("trims spaces around commas", () => {
    expect(parseAdminEmails("a@b.com , c@d.com")).toEqual(["a@b.com", "c@d.com"]);
  });

  it("handles a single email", () => {
    expect(parseAdminEmails("a@b.com")).toEqual(["a@b.com"]);
  });

  it("returns empty array for empty string", () => {
    expect(parseAdminEmails("")).toEqual([]);
  });

  it("returns empty array for undefined (missing env var)", () => {
    expect(parseAdminEmails(undefined)).toEqual([]);
  });
});
```

**Step 2: Run the tests to confirm they fail**

```bash
npx vitest run src/lib/utils/parseAdminEmails.test.ts
```

Expected: 5 failures — "Cannot find module './parseAdminEmails'"

**Step 3: Implement the helper**

Create `src/lib/utils/parseAdminEmails.ts`:

```typescript
export function parseAdminEmails(envValue: string | undefined): string[] {
  return (envValue ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}
```

**Step 4: Run the tests to confirm they pass**

```bash
npx vitest run src/lib/utils/parseAdminEmails.test.ts
```

Expected: 5 passing.

**Step 5: Run the full test suite to confirm nothing broke**

```bash
npm test
```

Expected: all tests passing (was 20 before, now 25).

**Step 6: Commit**

```bash
git add src/lib/utils/parseAdminEmails.ts src/lib/utils/parseAdminEmails.test.ts
git commit -m "feat: add parseAdminEmails helper with tests"
```

---

## Task 2: Update `proxy.ts` to use `ADMIN_EMAILS`

**Files:**
- Modify: `src/proxy.ts` (lines 48–50)

**Step 1: Import the helper at the top of `proxy.ts`**

Add this import after the existing imports (line 4):

```typescript
import { parseAdminEmails } from "@/lib/utils/parseAdminEmails";
```

**Step 2: Replace the email check**

Find (lines 48–50):

```typescript
    if (user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
```

Replace with:

```typescript
    const allowedEmails = parseAdminEmails(process.env.ADMIN_EMAILS);
    if (!allowedEmails.includes(user.email ?? "")) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
```

**Step 3: Run the full test suite**

```bash
npm test
```

Expected: all tests still passing (proxy.ts logic is not unit-tested, but the helper is).

**Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add src/proxy.ts
git commit -m "feat: use ADMIN_EMAILS allowlist in proxy.ts"
```

---

## Task 3: Update env files

**Files:**
- Modify: `.env.local` (rename `ADMIN_EMAIL` → `ADMIN_EMAILS`)
- Modify: `CLAUDE.md` (document the env var format)

**Step 1: Update `.env.local`**

Find the line:
```
ADMIN_EMAIL=<value>
```

Replace with:
```
ADMIN_EMAILS=<same-value>
```

(Keep the same email address — just rename the key and you can add more comma-separated later.)

**Step 2: Add a note to `CLAUDE.md`**

Open `CLAUDE.md` and append at the end:

```markdown
## Admin Access

Admin emails are controlled by the `ADMIN_EMAILS` env var (comma-separated):

```
ADMIN_EMAILS=stanovets.eu@gmail.com,another@example.com
```

To add or remove an admin: edit this value in Vercel → Settings → Environment Variables → redeploy.
```

**Step 3: Verify dev server starts without errors**

```bash
npm run dev 2>&1 | head -20
```

Expected: server starts, no env-related warnings.

**Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document ADMIN_EMAILS env var format"
```

Note: `.env.local` is gitignored and must NOT be committed.

---

## Task 4: Final verification

**Step 1: Run all tests**

```bash
npm test
```

Expected: 25/25 passing.

**Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Check commit log**

```bash
git log --oneline -4
```

Expected: 3 new commits on top of the base.

**Step 4: Reminder — update Vercel**

In Vercel dashboard → Settings → Environment Variables:
- Add `ADMIN_EMAILS` with value `stanovets.eu@gmail.com` (plus any additional emails comma-separated)
- Remove old `ADMIN_EMAIL` if it exists
- Redeploy
