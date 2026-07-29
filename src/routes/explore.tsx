import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "المستكشف | الرياضة المحلية" }, { name: "description", content: "استكشف الرياضة عبر مناطق ومدن وأحياء المملكة." }, { property: "og:title", content: "المستكشف" }, { property: "og:description", content: "استكشف الرياضة عبر مناطق ومدن وأحياء المملكة." }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["explore"],
    queryFn: async () => {
      const { data } = await supabase.from("regions").select("id, name_ar, name_en, slug, cities:cities(id, name_ar, name_en, slug, neighborhoods:neighborhoods(id, name_ar, name_en))").order("name_ar");
      return data ?? [];
    },
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">{t("explore")}</h1>
      <p className="text-sm text-muted-foreground mb-6">المملكة العربية السعودية → المنطقة → المدينة → الحي</p>
      {q.isLoading ? <Skeleton className="h-40" /> : (
        <div className="space-y-6">
          {q.data!.map((r) => (
            <section key={r.id} className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><MapPin className="size-4 text-primary" />{lang === "ar" ? r.name_ar : r.name_en}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(r as unknown as { cities: Array<{ id: string; name_ar: string; name_en: string; neighborhoods: Array<{ id: string; name_ar: string; name_en: string }> }> }).cities.map((c) => (
                  <div key={c.id}>
                    <Link to="/venues" search={{ city: c.id } as never} className="font-semibold hover:text-primary">
                      {lang === "ar" ? c.name_ar : c.name_en}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.neighborhoods.map((n) => (
                        <span key={n.id} className="text-xs rounded-md bg-muted px-2 py-0.5">
                          {lang === "ar" ? n.name_ar : n.name_en}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
