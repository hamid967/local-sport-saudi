import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { sportsProvider } from "@/lib/sports-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/site/empty-state";
import { useI18n } from "@/lib/i18n";
import { MapPin, Trophy } from "lucide-react";

export const Route = createFileRoute("/matches/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل المباراة | الرياضة المحلية" },
      { name: "description", content: "تفاصيل المباراة، النتيجة، الأحداث، والتشكيلة." },
      { property: "og:title", content: "تفاصيل المباراة" },
      { property: "og:description", content: "النتيجة، الأحداث، والتشكيلة." },
    ],
  }),
  component: MatchDetail,
});

function MatchDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const m = useQuery({ queryKey: ["match", id], queryFn: () => sportsProvider.getMatch(id) });
  const events = useQuery({ queryKey: ["events", id], queryFn: () => sportsProvider.getMatchEvents(id) });

  if (m.isLoading) return <div className="container mx-auto max-w-5xl px-4 py-6"><Skeleton className="h-64 rounded-xl" /></div>;
  if (!m.data) return <div className="container mx-auto max-w-5xl px-4 py-6"><EmptyState message={t("empty")} /></div>;

  const match = m.data;
  const isLive = match.status === "live" || match.status === "halftime";
  const isFinished = match.status === "finished";
  const homeName = lang === "ar" ? match.home_team?.name_ar : match.home_team?.name_en;
  const awayName = lang === "ar" ? match.away_team?.name_ar : match.away_team?.name_en;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <div className="rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground p-6 mb-6">
        <div className="text-xs opacity-80 mb-2">
          {match.competition ? (lang === "ar" ? match.competition.name_ar : match.competition.name_en) : ""}
          {match.matchday ? ` · ${t("matchdayN")} ${match.matchday}` : ""}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="text-center">
            <div className="size-16 rounded-full mx-auto mb-2" style={{ background: match.home_team?.color ?? "rgba(255,255,255,0.2)" }} />
            <div className="font-bold">{homeName}</div>
          </div>
          <div className="text-center">
            {isLive ? (
              <>
                <div className="text-xs live-pulse font-bold mb-1">🔴 {t("live")} · {match.minute}{t("minute")}</div>
                <div className="text-4xl font-bold tabular-nums">{match.home_score} - {match.away_score}</div>
              </>
            ) : isFinished ? (
              <>
                <div className="text-xs opacity-80 mb-1">{t("finished")}</div>
                <div className="text-4xl font-bold tabular-nums">{match.home_score} - {match.away_score}</div>
              </>
            ) : (
              <>
                <div className="text-xs opacity-80 mb-1">{format(new Date(match.kickoff_at), "EEE, MMM d")}</div>
                <div className="text-3xl font-bold tabular-nums">{format(new Date(match.kickoff_at), "HH:mm")}</div>
              </>
            )}
          </div>
          <div className="text-center">
            <div className="size-16 rounded-full mx-auto mb-2" style={{ background: match.away_team?.color ?? "rgba(255,255,255,0.2)" }} />
            <div className="font-bold">{awayName}</div>
          </div>
        </div>
        {match.venue && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm opacity-90">
            <MapPin className="size-4" />
            {lang === "ar" ? match.venue.name_ar : match.venue.name_en}
          </div>
        )}
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">{t("events")}</TabsTrigger>
          <TabsTrigger value="lineups">{t("lineups")}</TabsTrigger>
          <TabsTrigger value="stats">{t("stats")}</TabsTrigger>
          <TabsTrigger value="commentary">{t("commentary")}</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          {events.isLoading ? (
            <Skeleton className="h-40" />
          ) : (events.data ?? []).length === 0 ? (
            <EmptyState message={t("empty")} />
          ) : (
            <ul className="space-y-2">
              {events.data!.map((ev: never) => {
                const e = ev as { id: string; event_type: string; minute: number | null; detail: string | null; team: { name_ar: string; name_en: string } | null; player: { full_name_ar: string; full_name_en: string } | null };
                const teamName = e.team ? (lang === "ar" ? e.team.name_ar : e.team.name_en) : "";
                const player = e.player ? (lang === "ar" ? e.player.full_name_ar : e.player.full_name_en) : "";
                return (
                  <li key={e.id} className="flex items-center gap-3 rounded-md border border-border p-3 bg-card">
                    <span className="text-xs font-bold text-primary w-10 tabular-nums">{e.minute ?? ""}{t("minute")}</span>
                    <span className="text-lg">{eventIcon(e.event_type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{player || teamName}</div>
                      {e.detail && <div className="text-xs text-muted-foreground">{e.detail}</div>}
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-[10rem]">{teamName}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="lineups" className="mt-4"><Lineups matchId={id} homeId={match.home_team!.id} awayId={match.away_team!.id} /></TabsContent>
        <TabsContent value="stats" className="mt-4"><Stats match={match} /></TabsContent>
        <TabsContent value="commentary" className="mt-4"><EmptyState message={t("empty")} /></TabsContent>
      </Tabs>
    </div>
  );
}

function eventIcon(type: string) {
  switch (type) {
    case "goal":
    case "penalty_goal": return "⚽";
    case "own_goal": return "🅾️";
    case "yellow_card": return "🟨";
    case "red_card": return "🟥";
    case "substitution": return "🔄";
    case "penalty_miss": return "❌";
    case "var": return "📺";
    default: return "•";
  }
}

function Lineups({ homeId, awayId }: { matchId: string; homeId: string; awayId: string }) {
  const { lang, t } = useI18n();
  const q = useQuery({
    queryKey: ["lineup", homeId, awayId],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_memberships")
        .select("team_id, jersey_number, role, player:player_id(full_name_ar, full_name_en, position)")
        .in("team_id", [homeId, awayId]);
      return data ?? [];
    },
  });
  if (q.isLoading) return <Skeleton className="h-40" />;
  const rows = (q.data ?? []) as Array<{ team_id: string; jersey_number: number | null; role: string | null; player: { full_name_ar: string; full_name_en: string; position: string | null } | null }>;
  const home = rows.filter((r) => r.team_id === homeId);
  const away = rows.filter((r) => r.team_id === awayId);
  if (home.length === 0 && away.length === 0) return <EmptyState message={t("empty")} />;
  const render = (list: typeof home) => (
    <ul className="space-y-1">
      {list.map((r, i) => (
        <li key={i} className="flex items-center gap-2 text-sm">
          <span className="w-6 text-center text-xs font-bold text-primary tabular-nums">{r.jersey_number ?? "-"}</span>
          <span>{r.player ? (lang === "ar" ? r.player.full_name_ar : r.player.full_name_en) : ""}</span>
          <span className="text-xs text-muted-foreground ms-auto">{r.player?.position}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border p-3 bg-card"><h3 className="font-semibold mb-2">{t("homeTeam")}</h3>{render(home)}</div>
      <div className="rounded-lg border border-border p-3 bg-card"><h3 className="font-semibold mb-2">{t("awayTeam")}</h3>{render(away)}</div>
    </div>
  );
}

function Stats({ match }: { match: { home_score: number; away_score: number } }) {
  const total = match.home_score + match.away_score || 1;
  const homePct = Math.round((match.home_score / total) * 100);
  return (
    <div className="rounded-lg border border-border p-4 bg-card space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1"><span>{match.home_score}</span><span>الأهداف</span><span>{match.away_score}</span></div>
        <div className="h-2 rounded-full bg-muted overflow-hidden flex">
          <div className="bg-primary" style={{ width: `${homePct}%` }} />
          <div className="bg-accent" style={{ width: `${100 - homePct}%` }} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1"><Trophy className="size-3" /> إحصاءات تفصيلية تُضاف عند ربط مزود البيانات</p>
    </div>
  );
}
