import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sportsProvider, type MatchRow } from "@/lib/sports-provider";
import { MatchCard } from "@/components/site/match-card";
import { EmptyState } from "@/components/site/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";

type Range = "live" | "today" | "tomorrow" | "week" | "month" | "year";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "المباريات | الرياضة المحلية" },
      { name: "description", content: "المباريات المباشرة والقادمة والمنتهية." },
      { property: "og:title", content: "المباريات | الرياضة المحلية" },
      { property: "og:description", content: "المباريات المباشرة والقادمة والمنتهية." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    range: (s.range as Range) ?? "today",
  }),
  component: MatchesPage,
});

function getRange(r: Range): [Date, Date] {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  if (r === "tomorrow") { start.setDate(start.getDate() + 1); end.setDate(end.getDate() + 1); }
  if (r === "week") { end.setDate(end.getDate() + 7); }
  if (r === "month") { end.setDate(end.getDate() + 30); }
  if (r === "year") { end.setFullYear(end.getFullYear() + 1); }
  return [start, end];
}

function MatchesPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/matches" });
  const [comp, setComp] = useState<string>("all");
  const [team, setTeam] = useState<string>("all");

  const competitions = useQuery({
    queryKey: ["competitions"],
    queryFn: async () => {
      const { data } = await supabase.from("competitions").select("id, name_ar, name_en").order("name_ar");
      return data ?? [];
    },
  });
  const teams = useQuery({
    queryKey: ["teams-list"],
    queryFn: async () => {
      const { data } = await supabase.from("teams").select("id, name_ar, name_en").order("name_ar");
      return data ?? [];
    },
  });

  const matches = useQuery({
    queryKey: ["matches", search.range, comp, team],
    queryFn: () => {
      if (search.range === "live") return sportsProvider.getLiveMatches();
      const [from, to] = getRange(search.range);
      return sportsProvider.getMatchesInRange(from, to, {
        competition: comp === "all" ? undefined : comp,
        team: team === "all" ? undefined : team,
      });
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, MatchRow[]>();
    (matches.data ?? []).forEach((m) => {
      const key = new Date(m.kickoff_at).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return Array.from(map.entries());
  }, [matches.data]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">{t("matches")}</h1>

      <Tabs
        value={search.range}
        onValueChange={(v) => navigate({ search: { range: v as Range } })}
        className="mb-4"
      >
        <TabsList className="flex flex-wrap w-full h-auto">
          <TabsTrigger value="live">🔴 {t("now")}</TabsTrigger>
          <TabsTrigger value="today">{t("today")}</TabsTrigger>
          <TabsTrigger value="tomorrow">{t("tomorrow")}</TabsTrigger>
          <TabsTrigger value="week">{t("week")}</TabsTrigger>
          <TabsTrigger value="month">{t("month")}</TabsTrigger>
          <TabsTrigger value="year">{t("year")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={comp} onValueChange={setComp}>
          <SelectTrigger className="w-56"><SelectValue placeholder={t("competitions")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")} — {t("competitions")}</SelectItem>
            {(competitions.data ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name_ar}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={team} onValueChange={setTeam}>
          <SelectTrigger className="w-56"><SelectValue placeholder={t("team")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")} — {t("team")}</SelectItem>
            {(teams.data ?? []).map((tt) => (
              <SelectItem key={tt.id} value={tt.id}>{tt.name_ar}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {matches.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState message={t("empty")} />
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, list]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                {new Date(date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
              </h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {list.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
