import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "articles",
  titleAr: "الأخبار",
  orderBy: { column: "published_at", ascending: false },
  searchField: "title_ar",
  listColumns: ["title_ar", "sport_id", "region_id", "published_at"],
  fields: [
    { name: "slug", label: "المعرّف", type: "text", required: true },
    { name: "title_ar", label: "العنوان عربي", type: "text", required: true },
    { name: "title_en", label: "العنوان إنجليزي", type: "text" },
    { name: "sport_id", label: "الرياضة", type: "ref", table: "sports", labelField: "name_ar" },
    { name: "region_id", label: "المنطقة", type: "ref", table: "regions", labelField: "name_ar" },
    { name: "excerpt_ar", label: "مقتطف", type: "textarea" },
    { name: "body_ar", label: "نص المقال", type: "textarea" },
    { name: "cover_image", label: "صورة الغلاف", type: "url" },
    { name: "published_at", label: "تاريخ النشر", type: "datetime-local" },
  ],
};

export const Route = createFileRoute("/admin/articles")({
  component: () => <AdminCrud config={config} />,
});