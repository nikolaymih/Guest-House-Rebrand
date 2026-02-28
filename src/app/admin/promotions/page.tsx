import AdminPromotionManager from "@/components/admin/AdminPromotionManager";

export default function AdminPromotionsPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--color-espresso)] mb-2">
        Управление на промоции
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        Добавяйте, редактирайте и подреждайте промоции. Показват се само активните (с валидна крайна дата).
      </p>
      <AdminPromotionManager />
    </div>
  );
}
