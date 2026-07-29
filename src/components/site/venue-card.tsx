import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export type VenueCardProps = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  address: string | null;
  price_per_hour: number;
  rating: number | null;
  surface: string | null;
  cover_image: string | null;
};

export function VenueCard({ v }: { v: VenueCardProps }) {
  const { t, lang } = useI18n();
  const name = lang === "ar" ? v.name_ar : v.name_en;
  return (
    <Link
      to="/venues/$id"
      params={{ id: v.id }}
      className="group block rounded-lg border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 via-primary/10 to-muted grid place-items-center text-4xl">
        ⚽
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm truncate">{name}</h3>
          {v.rating ? (
            <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 shrink-0">
              <Star className="size-3 fill-current" />
              {v.rating}
            </span>
          ) : null}
        </div>
        {v.address && (
          <p className="text-xs text-muted-foreground flex items-start gap-1">
            <MapPin className="size-3 mt-0.5 shrink-0" />
            <span className="truncate">{v.address}</span>
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">{v.surface}</span>
          <span className="text-sm font-bold text-primary">
            {v.price_per_hour} <span className="text-xs font-normal">{t("pricePerHour")}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
