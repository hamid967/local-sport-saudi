import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/site/empty-state";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "المفضلة | الرياضة المحلية" }, { name: "description", content: "قائمة العناصر المفضلة." }, { property: "og:title", content: "المفضلة" }, { property: "og:description", content: "قائمة العناصر المفضلة." }] }),
  component: () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const q = useQuery({
      queryKey: ["favs", user?.id],
      enabled: !!user,
      queryFn: async () => (await supabase.from("favorites").select("*")).data ?? [],
    });
    if (!user) return <div className="container mx-auto max-w-md px-4 py-12 text-center"><p className="mb-4">{t("signInRequired")}</p><Link to="/auth"><Button>{t("signIn")}</Button></Link></div>;
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">{t("favorites")}</h1>
        {(q.data ?? []).length === 0 ? <EmptyState message={t("empty")} /> : (
          <ul className="space-y-2">{q.data!.map((f) => <li key={f.id} className="rounded-md border border-border bg-card p-3 text-sm">{f.entity_type} · {f.entity_id}</li>)}</ul>
        )}
      </div>
    );
  },
});
