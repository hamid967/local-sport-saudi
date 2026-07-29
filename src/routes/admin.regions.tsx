import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "regions",
  titleAr: "المناطق",
  orderBy: { column: "name_ar" },
  searchField: "name_ar",
  listColumns: ["name_ar", "name_en", "slug"],
  fields: [
    { name: "slug", label: "المعرّف", type: "text", required: true },
    { name: "name_ar", label: "الاسم عربي", type: "text", required: true },
    { name: "name_en", label: "الاسم إنجليزي", type: "text", required: true },
  ],
};

export const Route = createFileRoute("/admin/regions")({
  component: () => <AdminCrud config={config} />,
});