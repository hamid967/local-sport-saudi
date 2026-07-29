import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "الإدارة | الرياضة المحلية" },
      { name: "description", content: "لوحة إدارة منصة الرياضة المحلية." },
      { property: "og:title", content: "الإدارة" },
      { property: "og:description", content: "لوحة إدارة منصة الرياضة المحلية." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV: { to: string; label: string }[] = [
  { to: "/admin", label: "لوحة القيادة" },
  { to: "/admin/sports", label: "الرياضات" },
  { to: "/admin/regions", label: "المناطق" },
  { to: "/admin/cities", label: "المدن" },
  { to: "/admin/neighborhoods", label: "الأحياء" },
  { to: "/admin/competitions", label: "المسابقات" },
  { to: "/admin/seasons", label: "المواسم" },
  { to: "/admin/teams", label: "الفرق" },
  { to: "/admin/players", label: "اللاعبون" },
  { to: "/admin/matches", label: "المباريات" },
  { to: "/admin/venues", label: "الملاعب" },
  { to: "/admin/articles", label: "الأخبار" },
  { to: "/admin/roles", label: "الأدوار" },
];

function AdminLayout() {
  const { user, roles, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12 text-center">
        <p className="mb-4 text-muted-foreground">يجب تسجيل الدخول للوصول إلى لوحة الإدارة.</p>
        <Link to="/auth"><Button>تسجيل الدخول</Button></Link>
      </div>
    );
  }
  const canAccess = roles.includes("system_admin") || roles.includes("editor") || roles.includes("region_admin");
  if (!canAccess) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-muted-foreground">ليست لديك صلاحيات للوصول إلى لوحة الإدارة.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-56 shrink-0">
          <div className="rounded-lg border border-border bg-card p-2 sticky top-4">
            <div className="px-2 pb-2 text-xs font-semibold text-muted-foreground">الإدارة</div>
            <nav className="flex flex-col gap-0.5">
              {NAV.map((item) => {
                const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm transition-colors",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}