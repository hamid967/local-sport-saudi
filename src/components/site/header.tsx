import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search as SearchIcon, User as UserIcon, LogOut, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/site/notification-bell";

const NAV_KEYS = [
  ["home", "/"],
  ["matches", "/matches"],
  ["competitions", "/competitions"],
  ["venues", "/venues"],
  ["explore", "/explore"],
  ["news", "/news"],
] as const;

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const { user, signOut, roles } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={lang === "ar" ? "right" : "left"} className="w-72">
            <nav className="flex flex-col gap-1 mt-8">
              {NAV_KEYS.map(([k, href]) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm hover:bg-accent"
                >
                  {t(k as never)}
                </Link>
              ))}
              {user && (
                <>
                  <Link to="/bookings" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm hover:bg-accent">
                    {t("myBookings")}
                  </Link>
                  <Link to="/favorites" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm hover:bg-accent">
                    {t("favorites")}
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <span className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center text-sm">م</span>
          <span className="hidden sm:inline">{t("appName")}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 mx-4">
          {NAV_KEYS.map(([k, href]) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-accent",
                )}
              >
                {t(k as never)}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <Link to="/search" aria-label={t("search")}>
          <Button variant="ghost" size="icon">
            <SearchIcon className="size-5" />
          </Button>
        </Link>

        {user && <NotificationBell />}

        <Button
          variant="ghost"
          size="icon"
          aria-label="Language"
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        >
          <Languages className="size-5" />
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <UserIcon className="size-4" />
                <span className="hidden sm:inline max-w-[10ch] truncate">
                  {user.email?.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/bookings">{t("myBookings")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/favorites">{t("favorites")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/notifications">{t("notifications")}</Link>
              </DropdownMenuItem>
              {roles.includes("venue_owner") && (
                <DropdownMenuItem asChild>
                  <Link to="/owner">{t("ownerPanel")}</Link>
                </DropdownMenuItem>
              )}
              {(roles.includes("system_admin") || roles.includes("editor") || roles.includes("region_admin")) && (
                <DropdownMenuItem asChild>
                  <Link to="/admin">{t("admin")}</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => signOut()}>
                <LogOut className="size-4 me-2" />
                {t("signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/auth">
            <Button size="sm">{t("signIn")}</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
