import { useI18n } from "@/lib/i18n";

export function DemoBadge() {
  const { t } = useI18n();
  return (
    <div className="bg-primary/10 text-primary text-center text-xs font-medium py-1.5 px-3 border-b border-primary/20">
      <span aria-label="demo data indicator">⚠ {t("demoBadge")} — Demo data</span>
    </div>
  );
}
