import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "venues",
  titleAr: "الملاعب",
  orderBy: { column: "name_ar" },
  searchField: "name_ar",
  listColumns: ["name_ar", "city_id", "sport_id", "price_per_hour", "is_approved", "is_bookable"],
  fields: [
    { name: "sport_id", label: "الرياضة", type: "ref", table: "sports", labelField: "name_ar" },
    { name: "city_id", label: "المدينة", type: "ref", table: "cities", labelField: "name_ar", required: true },
    { name: "neighborhood_id", label: "الحي", type: "ref", table: "neighborhoods", labelField: "name_ar" },
    { name: "slug", label: "المعرّف", type: "text", required: true },
    { name: "name_ar", label: "الاسم عربي", type: "text", required: true },
    { name: "name_en", label: "الاسم إنجليزي", type: "text", required: true },
    { name: "address", label: "العنوان", type: "text" },
    { name: "latitude", label: "خط العرض", type: "number" },
    { name: "longitude", label: "خط الطول", type: "number" },
    { name: "surface", label: "الأرضية", type: "text" },
    { name: "price_per_hour", label: "السعر/ساعة", type: "number", required: true },
    { name: "rating", label: "التقييم", type: "number", step: "0.1" },
    { name: "cover_image", label: "صورة الغلاف", type: "url" },
    { name: "description", label: "الوصف", type: "textarea" },
    { name: "is_approved", label: "معتمد", type: "boolean" },
    { name: "is_bookable", label: "قابل للحجز", type: "boolean" },
  ],
};

export const Route = createFileRoute("/admin/venues")({
  component: () => <AdminCrud config={config} />,
});