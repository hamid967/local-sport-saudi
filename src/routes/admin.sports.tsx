import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "sports",
  titleAr: "الرياضات",
  orderBy: { column: "name_ar" },
  searchField: "name_ar",
  listColumns: ["name_ar", "name_en", "slug", "icon", "is_active"],
  fields: [
    { name: "slug", label: "المعرّف (slug)", type: "text", required: true },
    { name: "name_ar", label: "الاسم عربي", type: "text", required: true },
    { name: "name_en", label: "الاسم إنجليزي", type: "text", required: true },
    { name: "icon", label: "الأيقونة", type: "text" },
    { name: "is_active", label: "مفعّلة", type: "boolean" },
  ],
};

export const Route = createFileRoute("/admin/sports")({
  component: () => <AdminCrud config={config} />,
});