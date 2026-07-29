import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/site/empty-state";

export const Route = createFileRoute("/owner")({
  head: () => ({ meta: [{ title: "لوحة المالك | الرياضة المحلية" }, { name: "description", content: "إدارة ملاعبك وحجوزاتها." }, { property: "og:title", content: "لوحة المالك" }, { property: "og:description", content: "إدارة ملاعبك وحجوزاتها." }, { name: "robots", content: "noindex" }] }),
  component: () => {
    const { t, lang } = useI18n();
    const { user, loading } = useAuth();
    const venues = useQuery({
      queryKey: ["owner-venues", user?.id],
      enabled: !!user,
      queryFn: async () => (await supabase.from("venues").select("id, name_ar, name_en, price_per_hour, is_approved").eq("owner_id", user!.id)).data ?? [],
    });
    const bookings = useQuery({
      queryKey: ["owner-bookings", user?.id],
      enabled: !!user,
      queryFn: async () => (await supabase.from("bookings").select("*, venue:venue_id(name_ar, name_en, owner_id)").order("start_at", { ascending: false })).data ?? [],
    });
    if (loading) return <div className="container mx-auto max-w-5xl px-4 py-6"><Skeleton className="h-40" /></div>;
    if (!user) return <div className="container mx-auto max-w-md px-4 py-12 text-center"><Link to="/auth"><Button>{t("signIn")}</Button></Link></div>;
    return (
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">{t("ownerPanel")}</h1>
        <h2 className="font-semibold mb-2">ملاعبي</h2>
        {(venues.data ?? []).length === 0 ? <EmptyState message="لا توجد ملاعب مسجلة باسمك بعد" /> : (
          <ul className="rounded-lg border border-border bg-card divide-y divide-border mb-6">
            {venues.data!.map((v) => (
              <li key={v.id} className="p-3 flex items-center justify-between">
                <Link to="/venues/$id" params={{ id: v.id }} className="font-semibold hover:text-primary">{lang === "ar" ? v.name_ar : v.name_en}</Link>
                <span className="text-sm text-primary">{v.price_per_hour} ريال/س</span>
              </li>
            ))}
          </ul>
        )}
        <h2 className="font-semibold mb-2">حجوزات ملاعبي</h2>
        {(bookings.data ?? []).length === 0 ? <EmptyState message={t("empty")} /> : (
          <ul className="rounded-lg border border-border bg-card divide-y divide-border">
            {bookings.data!.map((b) => (
              <li key={b.id} className="p-3 text-sm">
                <div className="font-semibold">{(b.venue as unknown as { name_ar: string }).name_ar}</div>
                <div className="text-muted-foreground tabular-nums">{new Date(b.start_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
});
