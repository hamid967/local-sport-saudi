import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/site/empty-state";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { MapPin, Star, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/venues/$id")({
  head: () => ({
    meta: [
      { title: "ملعب | الرياضة المحلية" },
      { name: "description", content: "تفاصيل الملعب وحجز الأوقات." },
      { property: "og:title", content: "تفاصيل ملعب" },
      { property: "og:description", content: "تفاصيل الملعب وحجز الأوقات." },
    ],
  }),
  component: VenueDetail,
});

function VenueDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("18:00");
  const [duration, setDuration] = useState(1);

  const v = useQuery({
    queryKey: ["venue", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("venues")
        .select("*, facilities:venue_facilities(facility), city:city_id(name_ar,name_en), neighborhood:neighborhood_id(name_ar,name_en)")
        .eq("id", id)
        .single();
      return data;
    },
  });

  const dayBookings = useQuery({
    queryKey: ["venue-bookings", id, date],
    queryFn: async () => {
      const from = new Date(`${date}T00:00:00`).toISOString();
      const to = new Date(`${date}T23:59:59`).toISOString();
      const { data } = await supabase.from("bookings").select("start_at, end_at").eq("venue_id", id).in("status", ["pending", "confirmed"]).gte("start_at", from).lte("end_at", to);
      return data ?? [];
    },
  });

  const book = useMutation({
    mutationFn: async () => {
      const start = new Date(`${date}T${startTime}:00`);
      const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
      const { data, error } = await supabase.rpc("create_booking", {
        _venue_id: id,
        _start: start.toISOString(),
        _end: end.toISOString(),
        _notes: null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(t("reserveConfirmed"));
      qc.invalidateQueries({ queryKey: ["venue-bookings", id] });
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      navigate({ to: "/bookings" });
    },
    onError: (e: Error) => {
      if (e.message?.includes("bookings_no_overlap") || e.message?.includes("conflicting")) {
        toast.error(t("bookingSlotTaken"));
      } else {
        toast.error(t("reserveError") + ": " + e.message);
      }
    },
  });

  if (v.isLoading) return <div className="container mx-auto max-w-5xl px-4 py-6"><Skeleton className="h-64" /></div>;
  if (!v.data) return <div className="container mx-auto max-w-5xl px-4 py-6"><EmptyState message={t("empty")} /></div>;

  const venue = v.data as { id: string; name_ar: string; name_en: string; address: string | null; surface: string | null; price_per_hour: number; rating: number | null; description: string | null; facilities: { facility: string }[]; city: { name_ar: string; name_en: string } | null; neighborhood: { name_ar: string; name_en: string } | null };
  const name = lang === "ar" ? venue.name_ar : venue.name_en;
  const total = (venue.price_per_hour * duration).toFixed(2);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="aspect-[21/9] rounded-xl bg-gradient-to-br from-primary/30 via-primary/15 to-muted grid place-items-center text-7xl mb-6">
        ⚽
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
            {venue.rating && (
              <span className="inline-flex items-center gap-1 text-amber-600 shrink-0">
                <Star className="size-4 fill-current" /> {venue.rating}
              </span>
            )}
          </div>
          {venue.address && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
              <MapPin className="size-4" /> {venue.address}
            </p>
          )}
          {venue.description && <p className="mb-4">{venue.description}</p>}

          <div className="grid grid-cols-2 gap-2 mb-6">
            <InfoTile label={t("surface")} value={venue.surface ?? "—"} />
            <InfoTile label={t("city")} value={venue.city ? (lang === "ar" ? venue.city.name_ar : venue.city.name_en) : "—"} />
          </div>

          <h2 className="font-semibold mb-2">{t("facilities")}</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {venue.facilities.map((f) => (
              <span key={f.facility} className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs">
                <CheckCircle2 className="size-3 text-primary" /> {f.facility}
              </span>
            ))}
          </div>

          <h2 className="font-semibold mb-2">الحجوزات في {date}</h2>
          {(dayBookings.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">لا حجوزات في هذا اليوم</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {dayBookings.data!.map((b, i) => (
                <li key={i} className="text-xs rounded-md bg-muted px-2 py-1 tabular-nums">
                  {new Date(b.start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {" — "}
                  {new Date(b.end_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="rounded-xl border border-border bg-card p-4 h-fit sticky top-16 space-y-3">
          <div className="text-2xl font-bold text-primary">
            {venue.price_per_hour} <span className="text-sm font-normal text-muted-foreground">{t("pricePerHour")}</span>
          </div>
          <div className="space-y-1.5">
            <Label>{t("date")}</Label>
            <Input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("time")}</Label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("duration")} ({t("hours")})</Label>
            <Input type="number" min={1} max={6} value={duration} onChange={(e) => setDuration(Math.max(1, Math.min(6, Number(e.target.value))))} />
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <span className="text-sm">{t("total")}</span>
            <span className="font-bold text-primary">{total} ريال</span>
          </div>
          {user ? (
            <Button className="w-full" size="lg" onClick={() => book.mutate()} disabled={book.isPending}>
              {book.isPending ? t("loading") : t("bookNow")}
            </Button>
          ) : (
            <Link to="/auth" search={{ redirect: `/venues/${id}` } as never}>
              <Button className="w-full" size="lg">{t("signInRequired")}</Button>
            </Link>
          )}
          <p className="text-xs text-muted-foreground text-center">دفع تجريبي — لا يتم خصم أي مبلغ</p>
        </aside>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
