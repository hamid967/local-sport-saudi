import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { useNotifications } from "@/hooks/use-notifications";
import { EmptyState } from "@/components/site/empty-state";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "الإشعارات | الرياضة المحلية" }, { name: "description", content: "إشعاراتك." }, { property: "og:title", content: "الإشعارات" }, { property: "og:description", content: "إشعاراتك." }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data, unread, markAllRead } = useNotifications();

  if (!user)
    return (
      <div className="container mx-auto max-w-md px-4 py-12 text-center">
        <p className="mb-4">{t("signInRequired")}</p>
        <Link to="/auth"><Button>{t("signIn")}</Button></Link>
      </div>
    );

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold flex-1">{t("notifications")}</h1>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            تعليم الكل كمقروء ({unread})
          </Button>
        )}
      </div>
      {(data ?? []).length === 0 ? (
        <EmptyState message={t("empty")} />
      ) : (
        <ul className="space-y-2">
          {data!.map((n) => {
            const inner = (
              <>
                <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                <div className="font-semibold">{n.title}</div>
                {n.body && <div className="text-sm">{n.body}</div>}
              </>
            );
            return (
              <li
                key={n.id}
                className={`rounded-lg border p-3 ${n.read_at ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
              >
                {n.link ? (
                  <Link to={n.link} className="block hover:text-primary">{inner}</Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
