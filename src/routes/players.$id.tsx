import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/site/empty-state";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/players/$id")({
  head: () => ({ meta: [{ title: "لاعب | الرياضة المحلية" }, { name: "description", content: "معلومات اللاعب." }, { property: "og:title", content: "لاعب" }, { property: "og:description", content: "معلومات اللاعب." }] }),
  component: () => {
    const { id } = Route.useParams();
    const { t, lang } = useI18n();
    const q = useQuery({ queryKey: ["player", id], queryFn: async () => (await supabase.from("players").select("*").eq("id", id).single()).data });
    if (q.isLoading) return <div className="container mx-auto max-w-3xl px-4 py-6"><Skeleton className="h-40" /></div>;
    if (!q.data) return <div className="container mx-auto max-w-3xl px-4 py-6"><EmptyState message={t("empty")} /></div>;
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold">{lang === "ar" ? q.data.full_name_ar : q.data.full_name_en}</h1>
        <p className="text-muted-foreground">{q.data.position} · {q.data.nationality}</p>
      </div>
    );
  },
});
