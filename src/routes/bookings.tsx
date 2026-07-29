import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/site/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "حجوزاتي | الرياضة المحلية" }, { name: "description", content: "قائمة حجوزاتك للملاعب." }, { property: "og:title", content: "حجوزاتي" }, { property: "og:description", content: "قائمة حجوزاتك للملاعب." }] }),
  component: BookingsPage,
});

function BookingsPage() {
  const { t, lang } = useI18n();
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const bookings = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*, venue:venue_id(id, name_ar, name_en, address)").order("start_at", { ascending: false });
      return data ?? [];
    },
  });
  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("تم الإلغاء"); qc.invalidateQueries({ queryKey: ["my-bookings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) return <div className="container mx-auto max-w-5xl px-4 py-6"><Skeleton className="h-40" /></div>;
  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12 text-center">
        <p className="mb-4">{t("signInRequired")}</p>
        <Link to="/auth"><Button>{t("signIn")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">{t("myBookings")}</h1>
      {bookings.isLoading ? <Skeleton className="h-40" /> : (bookings.data ?? []).length === 0 ? (
        <EmptyState message={t("empty")} />
      ) : (
        <ul className="space-y-3">
          {bookings.data!.map((b) => {
            const v = b.venue as { id: string; name_ar: string; name_en: string; address: string | null } | null;
            return (
              <li key={b.id} className="rounded-lg border border-border bg-card p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <Link to="/venues/$id" params={{ id: v?.id ?? "" }} className="font-semibold hover:text-primary">
                    {v ? (lang === "ar" ? v.name_ar : v.name_en) : "—"}
                  </Link>
                  <div className="text-xs text-muted-foreground">{v?.address}</div>
                  <div className="text-sm mt-1 tabular-nums">
                    {new Date(b.start_at).toLocaleString()} — {new Date(b.end_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">{b.total_price} ريال</span>
                  <span className={`text-xs rounded-md px-2 py-0.5 ${b.status === "confirmed" ? "bg-primary/10 text-primary" : b.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>
                    {b.status}
                  </span>
                  {b.status !== "cancelled" && new Date(b.start_at) > new Date() && (
                    <Button variant="outline" size="sm" onClick={() => cancel.mutate(b.id)}>{t("cancel")}</Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
