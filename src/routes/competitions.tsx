import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/site/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/competitions")({
  head: () => ({
    meta: [
      { title: "المسابقات | الرياضة المحلية" },
      { name: "description", content: "قائمة المسابقات المحلية." },
      { property: "og:title", content: "المسابقات" },
      { property: "og:description", content: "قائمة المسابقات المحلية." },
    ],
  }),
  component: () => {
    const { t, lang } = useI18n();
    const q = useQuery({
      queryKey: ["all-competitions"],
      queryFn: async () => {
        const { data } = await supabase.from("competitions").select("id, name_ar, name_en, level, region:region_id(name_ar)").order("name_ar");
        return data ?? [];
      },
    });
    return (
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">{t("competitions")}</h1>
        {q.isLoading ? <Skeleton className="h-40" /> : (q.data ?? []).length === 0 ? <EmptyState message={t("empty")} /> : (
          <div className="grid gap-3 sm:grid-cols-2">
            {q.data!.map((c: { id: string; name_ar: string; name_en: string; level: string | null; region: { name_ar: string } | null }) => (
              <Link key={c.id} to="/competitions/$id" params={{ id: c.id }} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary/40">
                <Trophy className="size-8 text-primary shrink-0" />
                <div>
                  <div className="font-semibold">{lang === "ar" ? c.name_ar : c.name_en}</div>
                  <div className="text-xs text-muted-foreground">{c.level} {c.region ? `· ${c.region.name_ar}` : ""}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  },
});
