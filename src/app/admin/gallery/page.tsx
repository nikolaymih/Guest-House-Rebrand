import AdminGalleryManager from "@/components/admin/AdminGalleryManager";

export default function AdminGalleryPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-8">
        Управление на галерия
      </h1>
      <AdminGalleryManager />
    </div>
  );
}
