import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/site/empty-state";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "الإشعارات | الرياضة المحلية" }, { name: "description", content: "إشعاراتك." }, { property: "og:title", content: "الإشعارات" }, { property: "og:description", content: "إشعاراتك." }] }),
  component: () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const q = useQuery({
      queryKey: ["notifs", user?.id],
      enabled: !!user,
      queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false })).data ?? [],
    });
    if (!user) return <div className="container mx-auto max-w-md px-4 py-12 text-center"><p className="mb-4">{t("signInRequired")}</p><Link to="/auth"><Button>{t("signIn")}</Button></Link></div>;
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">{t("notifications")}</h1>
        {(q.data ?? []).length === 0 ? <EmptyState message={t("empty")} /> : (
          <ul className="space-y-2">{q.data!.map((n) => (
            <li key={n.id} className="rounded-lg border border-border bg-card p-3">
              <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
              <div className="font-semibold">{n.title}</div>
              {n.body && <div className="text-sm">{n.body}</div>}
            </li>
          ))}</ul>
        )}
      </div>
    );
  },
});
