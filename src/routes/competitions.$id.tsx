import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/site/empty-state";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/competitions/$id")({
  head: () => ({
    meta: [{ title: "المسابقة | الرياضة المحلية" }, { name: "description", content: "ترتيب وهدافون." }, { property: "og:title", content: "المسابقة" }, { property: "og:description", content: "ترتيب وهدافون." }],
  }),
  component: CompDetail,
});

function CompDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const comp = useQuery({
    queryKey: ["comp", id],
    queryFn: async () => {
      const { data } = await supabase.from("competitions").select("id, name_ar, name_en, seasons(id, name, is_current)").eq("id", id).single();
      return data;
    },
  });
  const currentSeason = comp.data?.seasons?.find((s: { is_current: boolean }) => s.is_current) ?? comp.data?.seasons?.[0];
  const standings = useQuery({
    queryKey: ["standings", currentSeason?.id],
    enabled: !!currentSeason?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("standings")
        .select("*, team:team_id(id, name_ar, name_en, color)")
        .eq("season_id", currentSeason!.id)
        .order("position");
      return data ?? [];
    },
  });
  const scorers = useQuery({
    queryKey: ["scorers", id, currentSeason?.id],
    enabled: !!currentSeason?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("match_events")
        .select("player:player_id(id, full_name_ar, full_name_en), team:team_id(name_ar, name_en)")
        .in("event_type", ["goal", "penalty_goal"]);
      const counts = new Map<string, { name: string; team: string; count: number }>();
      (data ?? []).forEach((e: { player: { id: string; full_name_ar: string; full_name_en: string } | null; team: { name_ar: string; name_en: string } | null }) => {
        if (!e.player) return;
        const key = e.player.id;
        const cur = counts.get(key) ?? { name: lang === "ar" ? e.player.full_name_ar : e.player.full_name_en, team: e.team ? (lang === "ar" ? e.team.name_ar : e.team.name_en) : "", count: 0 };
        cur.count++;
        counts.set(key, cur);
      });
      return Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 20);
    },
  });

  if (comp.isLoading) return <div className="container mx-auto max-w-5xl px-4 py-6"><Skeleton className="h-40" /></div>;
  if (!comp.data) return <div className="container mx-auto max-w-5xl px-4 py-6"><EmptyState message={t("empty")} /></div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">{lang === "ar" ? comp.data.name_ar : comp.data.name_en}</h1>
      <p className="text-sm text-muted-foreground mb-4">{currentSeason?.name}</p>

      <Tabs defaultValue="standings">
        <TabsList>
          <TabsTrigger value="standings">{t("standings")}</TabsTrigger>
          <TabsTrigger value="scorers">{t("topScorers")}</TabsTrigger>
        </TabsList>

        <TabsContent value="standings" className="mt-4">
          {standings.isLoading ? <Skeleton className="h-40" /> : (
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="p-2 text-start">#</th>
                    <th className="p-2 text-start">{t("team")}</th>
                    <th className="p-2">{t("played")}</th>
                    <th className="p-2">{t("wins")}</th>
                    <th className="p-2">{t("draws")}</th>
                    <th className="p-2">{t("losses")}</th>
                    <th className="p-2">{t("goalsFor")}</th>
                    <th className="p-2">{t("goalsAgainst")}</th>
                    <th className="p-2 font-bold">{t("points")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(standings.data ?? []).map((row: { position: number | null; team: { id: string; name_ar: string; name_en: string; color: string | null } | null; played: number; wins: number; draws: number; losses: number; goals_for: number; goals_against: number; points: number }, i) => (
                    <tr key={row.team?.id} className="border-t border-border">
                      <td className="p-2">{row.position ?? i + 1}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="size-4 rounded-full" style={{ background: row.team?.color ?? "var(--muted)" }} />
                          <span className="font-medium">{row.team ? (lang === "ar" ? row.team.name_ar : row.team.name_en) : ""}</span>
                        </div>
                      </td>
                      <td className="p-2 text-center tabular-nums">{row.played}</td>
                      <td className="p-2 text-center tabular-nums">{row.wins}</td>
                      <td className="p-2 text-center tabular-nums">{row.draws}</td>
                      <td className="p-2 text-center tabular-nums">{row.losses}</td>
                      <td className="p-2 text-center tabular-nums">{row.goals_for}</td>
                      <td className="p-2 text-center tabular-nums">{row.goals_against}</td>
                      <td className="p-2 text-center font-bold tabular-nums">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scorers" className="mt-4">
          {scorers.isLoading ? <Skeleton className="h-40" /> : (scorers.data ?? []).length === 0 ? <EmptyState message={t("empty")} /> : (
            <ol className="space-y-1">
              {scorers.data!.map((s, i) => (
                <li key={i} className="flex items-center gap-3 rounded-md border border-border bg-card p-2">
                  <span className="w-6 text-center text-xs font-bold text-primary">{i + 1}</span>
                  <span className="flex-1">{s.name}</span>
                  <span className="text-xs text-muted-foreground">{s.team}</span>
                  <span className="font-bold text-primary tabular-nums">{s.count}</span>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
