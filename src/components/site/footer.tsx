import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-muted/40 mt-12">
      <div className="container mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="font-bold text-foreground mb-2">{t("appName")}</div>
            <p className="text-xs">{t("tagline")}</p>
          </div>
          <div>
            <div className="font-semibold text-foreground mb-2">{t("matches")}</div>
            <ul className="space-y-1 text-xs">
              <li><Link to="/matches" className="hover:text-primary">{t("today")}</Link></li>
              <li><Link to="/competitions" className="hover:text-primary">{t("competitions")}</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-foreground mb-2">{t("venues")}</div>
            <ul className="space-y-1 text-xs">
              <li><Link to="/venues" className="hover:text-primary">{t("venues")}</Link></li>
              <li><Link to="/explore" className="hover:text-primary">{t("explore")}</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-foreground mb-2">{t("about")}</div>
            <ul className="space-y-1 text-xs">
              <li><Link to="/about" className="hover:text-primary">{t("about")}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">{t("privacy")}</Link></li>
              <li><Link to="/connect" className="hover:text-primary">ربط مساعد ذكي</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border text-xs text-center">
          © 2026 {t("appName")} — {t("footerNote")}
        </div>
      </div>
    </footer>
  );
}
