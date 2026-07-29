import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/site/empty-state";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/teams/$id")({
  head: () => ({ meta: [{ title: "الفريق | الرياضة المحلية" }, { name: "description", content: "تفاصيل الفريق واللاعبين." }, { property: "og:title", content: "الفريق" }, { property: "og:description", content: "تفاصيل الفريق واللاعبين." }] }),
  component: TeamPage,
});

function TeamPage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const team = useQuery({
    queryKey: ["team", id],
    queryFn: async () => (await supabase.from("teams").select("*, city:city_id(name_ar, name_en), memberships:team_memberships(jersey_number, role, player:player_id(id, full_name_ar, full_name_en, position))").eq("id", id).single()).data,
  });
  if (team.isLoading) return <div className="container mx-auto max-w-4xl px-4 py-6"><Skeleton className="h-40" /></div>;
  if (!team.data) return <div className="container mx-auto max-w-4xl px-4 py-6"><EmptyState message={t("empty")} /></div>;
  const d = team.data as unknown as { name_ar: string; name_en: string; color: string | null; city: { name_ar: string; name_en: string } | null; memberships: Array<{ jersey_number: number | null; role: string | null; player: { id: string; full_name_ar: string; full_name_en: string; position: string | null } | null }> };
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-full" style={{ background: d.color ?? "var(--muted)" }} />
        <div>
          <h1 className="text-2xl font-bold">{lang === "ar" ? d.name_ar : d.name_en}</h1>
          <div className="text-sm text-muted-foreground">{d.city ? (lang === "ar" ? d.city.name_ar : d.city.name_en) : ""}</div>
        </div>
      </div>
      <h2 className="font-semibold mb-2">{t("playersCount")}</h2>
      <ul className="rounded-lg border border-border bg-card divide-y divide-border">
        {d.memberships.length === 0 ? <li className="p-4 text-sm text-muted-foreground">{t("empty")}</li> : d.memberships.map((m, i) => (
          <li key={i} className="p-3 flex items-center gap-3">
            <span className="w-8 text-center font-bold text-primary tabular-nums">{m.jersey_number ?? "-"}</span>
            <span className="flex-1">{m.player ? (lang === "ar" ? m.player.full_name_ar : m.player.full_name_en) : ""}</span>
            <span className="text-xs text-muted-foreground">{m.player?.position}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
