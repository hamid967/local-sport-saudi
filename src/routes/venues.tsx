import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VenueCard } from "@/components/site/venue-card";
import { EmptyState } from "@/components/site/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/venues")({
  head: () => ({
    meta: [
      { title: "دليل الملاعب | الرياضة المحلية" },
      { name: "description", content: "استكشف واحجز ملاعب كرة القدم في مدن المملكة." },
      { property: "og:title", content: "دليل الملاعب" },
      { property: "og:description", content: "استكشف واحجز ملاعب كرة القدم في مدن المملكة." },
    ],
  }),
  component: VenuesPage,
});

function VenuesPage() {
  const { t, lang } = useI18n();
  const [city, setCity] = useState("all");
  const [surface, setSurface] = useState("all");
  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(300);

  const cities = useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await supabase.from("cities").select("id, name_ar, name_en").order("name_ar")).data ?? [],
  });

  const venues = useQuery({
    queryKey: ["venues", city, surface, q, maxPrice],
    queryFn: async () => {
      let query = supabase.from("venues").select("id, slug, name_ar, name_en, address, price_per_hour, rating, surface, cover_image, city_id").lte("price_per_hour", maxPrice);
      if (city !== "all") query = query.eq("city_id", city);
      if (surface !== "all") query = query.eq("surface", surface);
      if (q) query = query.or(`name_ar.ilike.%${q}%,name_en.ilike.%${q}%`);
      const { data } = await query.order("rating", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">{t("venues")}</h1>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] mb-6 items-end">
        <Input placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t("city")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            {(cities.data ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={surface} onValueChange={setSurface}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t("surface")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="عشب طبيعي">عشب طبيعي</SelectItem>
            <SelectItem value="عشب صناعي">عشب صناعي</SelectItem>
          </SelectContent>
        </Select>
        <div className="w-52">
          <div className="text-xs text-muted-foreground mb-1">حتى {maxPrice} ريال</div>
          <Slider value={[maxPrice]} min={50} max={500} step={10} onValueChange={(v) => setMaxPrice(v[0])} />
        </div>
      </div>

      {venues.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
      ) : (venues.data ?? []).length === 0 ? (
        <EmptyState message={t("empty")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.data!.map((v) => <VenueCard key={v.id} v={v} />)}
        </div>
      )}
    </div>
  );
}
