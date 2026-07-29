import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/site/empty-state";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "الأخبار | الرياضة المحلية" }, { name: "description", content: "آخر أخبار الرياضة المحلية." }, { property: "og:title", content: "الأخبار" }, { property: "og:description", content: "آخر أخبار الرياضة المحلية." }] }),
  component: () => {
    const { t } = useI18n();
    const q = useQuery({ queryKey: ["news"], queryFn: async () => (await supabase.from("articles").select("*").order("published_at", { ascending: false })).data ?? [] });
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">{t("news")}</h1>
        {(q.data ?? []).length === 0 ? <EmptyState message={t("empty")} /> : (
          <div className="grid gap-4 md:grid-cols-2">{q.data!.map((a) => (
            <article key={a.id} className="rounded-lg border border-border bg-card p-4">
              <h2 className="font-semibold mb-1">{a.title_ar}</h2>
              <p className="text-sm text-muted-foreground mb-2">{a.excerpt_ar}</p>
              <p className="text-sm">{a.body_ar}</p>
            </article>
          ))}</div>
        )}
      </div>
    );
  },
});
