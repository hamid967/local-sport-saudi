import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n";
import type { MatchRow } from "@/lib/sports-provider";
import { cn } from "@/lib/utils";

export function MatchCard({ match }: { match: MatchRow }) {
  const { t, lang } = useI18n();
  const isLive = match.status === "live" || match.status === "halftime";
  const isFinished = match.status === "finished";
  const name = (side: "home_team" | "away_team") => {
    const team = match[side];
    return team ? (lang === "ar" ? team.name_ar : team.name_en) : "—";
  };
  const compName = match.competition ? (lang === "ar" ? match.competition.name_ar : match.competition.name_en) : "";

  return (
    <Link
      to="/matches/$id"
      params={{ id: match.id }}
      className="block rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all p-3"
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span className="truncate">{compName}</span>
        {isLive ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-live/15 text-live px-2 py-0.5 font-semibold live-pulse">
            <span className="size-1.5 rounded-full bg-live" /> {t("live")} {match.minute ? `· ${match.minute}${t("minute")}` : ""}
          </span>
        ) : isFinished ? (
          <span className="rounded-md bg-muted px-2 py-0.5">{t("finished")}</span>
        ) : (
          <span>{format(new Date(match.kickoff_at), "HH:mm")}</span>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-6 rounded-full shrink-0" style={{ background: match.home_team?.color ?? "var(--muted)" }} />
          <span className="truncate text-sm font-medium">{name("home_team")}</span>
        </div>
        <div className={cn("text-lg font-bold tabular-nums", isLive && "text-live")}>
          {isFinished || isLive ? `${match.home_score} - ${match.away_score}` : "vs"}
        </div>
        <div className="flex items-center gap-2 min-w-0 justify-end">
          <span className="truncate text-sm font-medium text-end">{name("away_team")}</span>
          <span className="size-6 rounded-full shrink-0" style={{ background: match.away_team?.color ?? "var(--muted)" }} />
        </div>
      </div>
    </Link>
  );
}
