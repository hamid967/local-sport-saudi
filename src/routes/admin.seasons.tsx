import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "seasons",
  titleAr: "المواسم",
  orderBy: { column: "start_date", ascending: false },
  searchField: "name",
  listColumns: ["name", "competition_id", "start_date", "end_date", "is_current"],
  fields: [
    { name: "competition_id", label: "المسابقة", type: "ref", table: "competitions", labelField: "name_ar", required: true },
    { name: "name", label: "الاسم", type: "text", required: true },
    { name: "start_date", label: "تاريخ البدء", type: "date", required: true },
    { name: "end_date", label: "تاريخ الانتهاء", type: "date", required: true },
    { name: "is_current", label: "الحالي", type: "boolean" },
  ],
};

export const Route = createFileRoute("/admin/seasons")({
  component: () => <AdminCrud config={config} />,
});