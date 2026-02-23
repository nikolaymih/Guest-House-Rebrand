import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-[var(--color-espresso)] mb-4">403</h1>
        <p className="text-[var(--color-text-muted)] mb-6">Нямате достъп до тази страница.</p>
        <Link href="/" className="text-[var(--color-caramel)] hover:text-[var(--color-caramel-deep)] font-semibold">
          Към началото
        </Link>
      </div>
    </div>
  );
}
