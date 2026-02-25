export function parseAdminEmails(envValue: string | undefined): string[] {
  return (envValue ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}
