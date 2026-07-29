import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "competitions",
  titleAr: "المسابقات",
  orderBy: { column: "name_ar" },
  searchField: "name_ar",
  listColumns: ["name_ar", "name_en", "sport_id", "region_id", "level", "is_active"],
  fields: [
    { name: "sport_id", label: "الرياضة", type: "ref", table: "sports", labelField: "name_ar", required: true },
    { name: "region_id", label: "المنطقة", type: "ref", table: "regions", labelField: "name_ar" },
    { name: "slug", label: "المعرّف", type: "text", required: true },
    { name: "name_ar", label: "الاسم عربي", type: "text", required: true },
    { name: "name_en", label: "الاسم إنجليزي", type: "text", required: true },
    { name: "level", label: "المستوى", type: "text" },
    { name: "logo_url", label: "رابط الشعار", type: "url" },
    { name: "is_active", label: "مفعّلة", type: "boolean" },
  ],
};

export const Route = createFileRoute("/admin/competitions")({
  component: () => <AdminCrud config={config} />,
});