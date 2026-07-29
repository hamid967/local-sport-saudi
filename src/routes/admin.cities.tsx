import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "cities",
  titleAr: "المدن",
  orderBy: { column: "name_ar" },
  searchField: "name_ar",
  listColumns: ["name_ar", "name_en", "region_id", "slug"],
  fields: [
    { name: "region_id", label: "المنطقة", type: "ref", table: "regions", labelField: "name_ar", required: true },
    { name: "slug", label: "المعرّف", type: "text", required: true },
    { name: "name_ar", label: "الاسم عربي", type: "text", required: true },
    { name: "name_en", label: "الاسم إنجليزي", type: "text", required: true },
  ],
};

export const Route = createFileRoute("/admin/cities")({
  component: () => <AdminCrud config={config} />,
});