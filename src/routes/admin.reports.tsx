import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type Booking = {
  id: string;
  venue_id: string;
  start_at: string;
  end_at: string;
  total_price: number;
  status: string;
  created_at: string;
};

function useReports() {
  return useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString();
      const [bookingsRes, venuesRes] = await Promise.all([
        supabase.from("bookings").select("id, venue_id, start_at, end_at, total_price, status, created_at").gte("start_at", since),
        supabase.from("venues").select("id, name_ar, city_id"),
      ]);
      if (bookingsRes.error) throw bookingsRes.error;
      if (venuesRes.error) throw venuesRes.error;
      return {
        bookings: (bookingsRes.data ?? []) as Booking[],
        venues: (venuesRes.data ?? []) as Array<{ id: string; name_ar: string; city_id: string }>,
      };
    },
  });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tabular-nums text-primary">{value}</div>
    </div>
  );
}

function ReportsPage() {
  const q = useReports();

  if (q.isLoading) return <Skeleton className="h-64" />;
  if (q.error) return <p className="text-destructive text-sm">{(q.error as Error).message}</p>;

  const bookings = q.data!.bookings;
  const venueName = new Map(q.data!.venues.map((v) => [v.id, v.name_ar]));
  const active = bookings.filter((b) => b.status !== "cancelled");
  const revenue = active.reduce((s, b) => s + Number(b.total_price ?? 0), 0);
  const hours = active.reduce(
    (s, b) => s + (new Date(b.end_at).getTime() - new Date(b.start_at).getTime()) / 3600000,
    0,
  );
  const cancelRate = bookings.length ? (bookings.length - active.length) / bookings.length : 0;

  const byVenue = new Map<string, { count: number; revenue: number }>();
  for (const b of active) {
    const cur = byVenue.get(b.venue_id) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += Number(b.total_price ?? 0);
    byVenue.set(b.venue_id, cur);
  }
  const topVenues = [...byVenue.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 10);

  const byMonth = new Map<string, number>();
  for (const b of active) {
    const k = b.start_at.slice(0, 7);
    byMonth.set(k, (byMonth.get(k) ?? 0) + Number(b.total_price ?? 0));
  }
  const months = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const maxMonth = Math.max(1, ...months.map(([, v]) => v));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">التقارير والتحليلات</h1>
      <p className="text-sm text-muted-foreground mb-4">آخر 90 يومًا — بيانات تجريبية بلا مدفوعات حقيقية.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="إجمالي الحجوزات" value={String(bookings.length)} />
        <Stat label="الإيراد التقديري" value={`${revenue.toLocaleString()} ريال`} />
        <Stat label="ساعات الإشغال" value={hours.toFixed(1)} />
        <Stat label="نسبة الإلغاء" value={`${(cancelRate * 100).toFixed(0)}%`} />
      </div>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">الإيراد الشهري</h2>
        {months.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد بيانات.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            {months.map(([m, v]) => (
              <div key={m} className="flex items-center gap-3">
                <span className="w-20 text-xs tabular-nums text-muted-foreground">{m}</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(v / maxMonth) * 100}%` }} />
                </div>
                <span className="w-28 text-xs tabular-nums text-end">{v.toLocaleString()} ريال</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">أعلى الملاعب أداءً</h2>
        {topVenues.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد بيانات.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-start p-3 font-medium">الملعب</th>
                  <th className="text-start p-3 font-medium">الحجوزات</th>
                  <th className="text-start p-3 font-medium">الإيراد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topVenues.map(([id, s]) => (
                  <tr key={id}>
                    <td className="p-3">{venueName.get(id) ?? "—"}</td>
                    <td className="p-3 tabular-nums">{s.count}</td>
                    <td className="p-3 tabular-nums">{s.revenue.toLocaleString()} ريال</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});