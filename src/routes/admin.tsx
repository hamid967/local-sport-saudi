import { createFileRoute, Link, redirect, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "الإدارة | الرياضة المحلية" }, { name: "description", content: "لوحة الإدارة." }, { property: "og:title", content: "الإدارة" }, { property: "og:description", content: "لوحة الإدارة." }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { t } = useI18n();
  const { user, roles, loading } = useAuth();

  const counts = useQuery({
    queryKey: ["admin-counts"],
    enabled: !!user && (roles.includes("system_admin") || roles.includes("editor") || roles.includes("region_admin")),
    queryFn: async () => {
      const tables = ["sports", "regions", "cities", "neighborhoods", "competitions", "teams", "players", "venues", "matches", "bookings", "articles"] as const;
      const results = await Promise.all(tables.map(async (t) => {
        const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
        return [t, count ?? 0] as const;
      }));
      return Object.fromEntries(results);
    },
  });

  const audit = useQuery({
    queryKey: ["audit"],
    enabled: !!user && roles.includes("system_admin"),
    queryFn: async () => (await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  if (loading) return <div className="container mx-auto max-w-6xl px-4 py-6"><Skeleton className="h-40" /></div>;
  if (!user) return <div className="container mx-auto max-w-md px-4 py-12 text-center"><Link to="/auth"><Button>{t("signIn")}</Button></Link></div>;
  const canAccess = roles.includes("system_admin") || roles.includes("editor") || roles.includes("region_admin");
  if (!canAccess) {
    return <div className="container mx-auto max-w-md px-4 py-12 text-center"><p className="text-muted-foreground">ليست لديك صلاحيات للوصول إلى لوحة الإدارة</p></div>;
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t("admin")}</h1>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-8">
        {counts.data && Object.entries(counts.data).map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="text-2xl font-bold text-primary tabular-nums">{v}</div>
          </div>
        ))}
      </div>
      <h2 className="font-semibold mb-2">سجل التدقيق (audit log)</h2>
      {(audit.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد أحداث بعد.</p>
      ) : (
        <ul className="rounded-lg border border-border bg-card divide-y divide-border text-sm">
          {audit.data!.map((a) => (
            <li key={a.id} className="p-3 flex gap-3">
              <span className="text-xs text-muted-foreground tabular-nums w-40">{new Date(a.created_at).toLocaleString()}</span>
              <span className="font-semibold">{a.action}</span>
              <span className="text-muted-foreground">{a.entity_type} {a.entity_id}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground mt-6">
        هذه لوحة القراءة الأولية. إدارة الكيانات (إضافة/تعديل/حذف) عبر SQL في هذه المرحلة، وسنضيف واجهات CRUD مخصصة في التحديث القادم.
      </p>
    </div>
  );
}
