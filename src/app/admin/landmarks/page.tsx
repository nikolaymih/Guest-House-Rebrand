import AdminLandmarkManager from "@/components/admin/AdminLandmarkManager";

export default function AdminLandmarksPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-2">
        Управление на забележителности
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        По една снимка за всяка забележителност, показвана на детайлната страница.
      </p>
      <AdminLandmarkManager />
    </div>
  );
}
