import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "players",
  titleAr: "اللاعبون",
  orderBy: { column: "full_name_ar" },
  searchField: "full_name_ar",
  listColumns: ["full_name_ar", "full_name_en", "position", "nationality", "birth_date"],
  fields: [
    { name: "full_name_ar", label: "الاسم عربي", type: "text", required: true },
    { name: "full_name_en", label: "الاسم إنجليزي", type: "text", required: true },
    { name: "birth_date", label: "تاريخ الميلاد", type: "date" },
    { name: "nationality", label: "الجنسية", type: "text" },
    { name: "position", label: "المركز", type: "text" },
    { name: "photo_url", label: "رابط الصورة", type: "url" },
  ],
};

export const Route = createFileRoute("/admin/players")({
  component: () => <AdminCrud config={config} />,
});