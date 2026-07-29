import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud, type CrudConfig } from "@/components/admin/crud";

const config: CrudConfig = {
  table: "matches",
  titleAr: "المباريات",
  orderBy: { column: "kickoff_at", ascending: false },
  listColumns: ["kickoff_at", "home_team_id", "away_team_id", "home_score", "away_score", "status", "competition_id"],
  fields: [
    { name: "sport_id", label: "الرياضة", type: "ref", table: "sports", labelField: "name_ar", required: true },
    { name: "competition_id", label: "المسابقة", type: "ref", table: "competitions", labelField: "name_ar" },
    { name: "season_id", label: "الموسم", type: "ref", table: "seasons", labelField: "name" },
    { name: "home_team_id", label: "الفريق المضيف", type: "ref", table: "teams", labelField: "name_ar", required: true },
    { name: "away_team_id", label: "الفريق الضيف", type: "ref", table: "teams", labelField: "name_ar", required: true },
    { name: "venue_id", label: "الملعب", type: "ref", table: "venues", labelField: "name_ar" },
    { name: "kickoff_at", label: "موعد الانطلاق", type: "datetime-local", required: true },
    { name: "status", label: "الحالة", type: "select", options: [
      { value: "scheduled", label: "مجدولة" },
      { value: "live", label: "مباشر" },
      { value: "halftime", label: "استراحة" },
      { value: "finished", label: "منتهية" },
      { value: "postponed", label: "مؤجلة" },
      { value: "cancelled", label: "ملغاة" },
    ] },
    { name: "minute", label: "الدقيقة", type: "number" },
    { name: "home_score", label: "أهداف المضيف", type: "number" },
    { name: "away_score", label: "أهداف الضيف", type: "number" },
    { name: "round", label: "الدور", type: "text" },
    { name: "matchday", label: "الجولة", type: "number" },
  ],
};

export const Route = createFileRoute("/admin/matches")({
  component: () => <AdminCrud config={config} />,
});