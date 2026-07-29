import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "user_roles",
  titleAr: "الأدوار",
  orderBy: { column: "created_at", ascending: false },
  listColumns: ["user_id", "role", "region_id"],
  fields: [
    { name: "user_id", label: "معرّف المستخدم (UUID)", type: "text", required: true },
    { name: "role", label: "الدور", type: "select", required: true, options: [
      { value: "user", label: "مستخدم" },
      { value: "venue_owner", label: "مالك ملعب" },
      { value: "editor", label: "محرر" },
      { value: "region_admin", label: "مدير منطقة" },
      { value: "system_admin", label: "مدير نظام" },
    ] },
    { name: "region_id", label: "المنطقة (لدور مدير منطقة)", type: "ref", table: "regions", labelField: "name_ar" },
  ],
};

export const Route = createFileRoute("/admin/roles")({
  component: () => <AdminCrud config={config} />,
});