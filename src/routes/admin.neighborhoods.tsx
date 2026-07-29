import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "neighborhoods",
  titleAr: "الأحياء",
  orderBy: { column: "name_ar" },
  searchField: "name_ar",
  listColumns: ["name_ar", "name_en", "city_id", "slug"],
  fields: [
    { name: "city_id", label: "المدينة", type: "ref", table: "cities", labelField: "name_ar", required: true },
    { name: "slug", label: "المعرّف", type: "text", required: true },
    { name: "name_ar", label: "الاسم عربي", type: "text", required: true },
    { name: "name_en", label: "الاسم إنجليزي", type: "text", required: true },
  ],
};

export const Route = createFileRoute("/admin/neighborhoods")({
  component: () => <AdminCrud config={config} />,
});