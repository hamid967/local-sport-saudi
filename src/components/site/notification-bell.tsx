import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationBell() {
  const { unread } = useNotifications();
  return (
    <Link to="/notifications" aria-label={`الإشعارات${unread ? ` (${unread} غير مقروء)` : ""}`}>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-4 font-bold text-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>
    </Link>
  );
}