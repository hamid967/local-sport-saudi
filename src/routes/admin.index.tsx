import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const counts = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const tables = [
        "sports", "regions", "cities", "neighborhoods", "competitions",
        "teams", "players", "venues", "matches", "bookings", "articles",
      ] as const;
      const results = await Promise.all(
        tables.map(async (t) => {
          const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
          return [t, count ?? 0] as const;
        }),
      );
      return Object.fromEntries(results) as Record<string, number>;
    },
  });

  const audit = useQuery({
    queryKey: ["audit"],
    queryFn: async () =>
      (await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">لوحة القيادة</h1>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-8">
        {counts.data &&
          Object.entries(counts.data).map(([k, v]) => (
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
        <ul className="rounded-lg border border-border bg-card divide-y divide-border text-sm max-h-[480px] overflow-auto">
          {audit.data!.map((a) => (
            <li key={a.id} className="p-3 flex flex-wrap gap-3">
              <span className="text-xs text-muted-foreground tabular-nums w-40">
                {new Date(a.created_at).toLocaleString()}
              </span>
              <span className="font-semibold">{a.action}</span>
              <span className="text-muted-foreground text-xs">
                {a.entity_type} {a.entity_id}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground mt-6">
        استخدم القائمة الجانبية لإدارة كيانات المنصة (إضافة/تعديل/حذف).
      </p>
    </div>
  );
}