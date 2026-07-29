import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "teams",
  titleAr: "الفرق",
  orderBy: { column: "name_ar" },
  searchField: "name_ar",
  listColumns: ["name_ar", "name_en", "sport_id", "city_id", "short_name"],
  fields: [
    { name: "sport_id", label: "الرياضة", type: "ref", table: "sports", labelField: "name_ar", required: true },
    { name: "city_id", label: "المدينة", type: "ref", table: "cities", labelField: "name_ar" },
    { name: "slug", label: "المعرّف", type: "text", required: true },
    { name: "name_ar", label: "الاسم عربي", type: "text", required: true },
    { name: "name_en", label: "الاسم إنجليزي", type: "text", required: true },
    { name: "short_name", label: "الاسم المختصر", type: "text" },
    { name: "color", label: "اللون (hex)", type: "text" },
    { name: "founded_year", label: "سنة التأسيس", type: "number" },
    { name: "logo_url", label: "رابط الشعار", type: "url" },
  ],
};

export const Route = createFileRoute("/admin/teams")({
  component: () => <AdminCrud config={config} />,
});