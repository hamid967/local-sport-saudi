import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { sportsProvider } from "@/lib/sports-provider";
import { supabase } from "@/integrations/supabase/client";
import { MatchCard } from "@/components/site/match-card";
import { VenueCard } from "@/components/site/venue-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/empty-state";
import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الرياضة المحلية | Local Sport" },
      { name: "description", content: "نتائج مباشرة، جداول ومسابقات، وحجز ملاعب داخل المملكة." },
      { property: "og:title", content: "الرياضة المحلية | Local Sport" },
      { property: "og:description", content: "نتائج مباشرة، جداول ومسابقات، وحجز ملاعب داخل المملكة." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, lang } = useI18n();

  const live = useQuery({ queryKey: ["home", "live"], queryFn: () => sportsProvider.getLiveMatches() });
  const today = useQuery({
    queryKey: ["home", "today"],
    queryFn: () => {
      const s = new Date(); s.setHours(0, 0, 0, 0);
      const e = new Date(); e.setHours(23, 59, 59, 999);
      return sportsProvider.getMatchesInRange(s, e);
    },
  });
  const venues = useQuery({
    queryKey: ["home", "venues"],
    queryFn: async () => {
      const { data } = await supabase.from("venues").select("id, slug, name_ar, name_en, address, price_per_hour, rating, surface, cover_image").order("rating", { ascending: false }).limit(6);
      return data ?? [];
    },
  });
  const articles = useQuery({
    queryKey: ["home", "articles"],
    queryFn: async () => {
      const { data } = await supabase.from("articles").select("id, slug, title_ar, title_en, excerpt_ar, cover_image, published_at").order("published_at", { ascending: false }).limit(3);
      return data ?? [];
    },
  });

  const ArrowDir = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-glow text-primary-foreground">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_50%,white_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="container mx-auto max-w-7xl px-4 py-14 md:py-20 relative">
          <div className="max-w-2xl">
            <div className="inline-block rounded-full bg-primary-foreground/15 backdrop-blur px-3 py-1 text-xs font-medium mb-4">
              🇸🇦 {t("seasonSaudi")}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">{t("saudiFootball")}</h1>
            <p className="text-base md:text-lg opacity-90 mb-6">{t("heroDesc")}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/matches">
                <Button size="lg" variant="secondary" className="gap-2">
                  <CalendarDays className="size-4" />
                  {t("viewMatches")}
                </Button>
              </Link>
              <Link to="/venues">
                <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
                  <MapPin className="size-4" />
                  {t("exploreVenues")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-10">
        {/* Live */}
        <section>
          <SectionHeader title={t("liveMatches")} icon="🔴" href="/matches" Arrow={ArrowDir} label={t("all")} />
          {live.isLoading ? (
            <SkelGrid n={3} />
          ) : live.data && live.data.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {live.data.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          ) : (
            <EmptyState message={t("empty")} />
          )}
        </section>

        {/* Today */}
        <section>
          <SectionHeader title={t("todayMatches")} icon="📅" href="/matches" Arrow={ArrowDir} label={t("all")} />
          {today.isLoading ? (
            <SkelGrid n={3} />
          ) : today.data && today.data.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {today.data.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          ) : (
            <EmptyState message={t("empty")} />
          )}
        </section>

        {/* Venues */}
        <section>
          <SectionHeader title={t("nearbyVenues")} icon="🏟️" href="/venues" Arrow={ArrowDir} label={t("all")} />
          {venues.isLoading ? (
            <SkelGrid n={3} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(venues.data ?? []).map((v) => <VenueCard key={v.id} v={v} />)}
            </div>
          )}
        </section>

        {/* News */}
        <section>
          <SectionHeader title={t("latestNews")} icon="📰" href="/news" Arrow={ArrowDir} label={t("all")} />
          <div className="grid gap-4 md:grid-cols-3">
            {(articles.data ?? []).map((a) => (
              <article key={a.id} className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
                <Trophy className="size-6 text-primary mb-2" />
                <h3 className="font-semibold mb-1">{a.title_ar}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{a.excerpt_ar}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon, href, Arrow, label }: { title: string; icon: string; href: string; Arrow: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      <Link to={href} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
        {label} <Arrow className="size-4" />
      </Link>
    </div>
  );
}

function SkelGrid({ n }: { n: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
    </div>
  );
}
