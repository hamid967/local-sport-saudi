import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type AppNotification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  type: string;
  read_at: string | null;
  created_at: string;
};

/** Live notifications for the signed-in user (Realtime + cache). */
export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, link, type, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as AppNotification[];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as AppNotification;
          toast(n.title, { description: n.body ?? undefined });
          qc.invalidateQueries({ queryKey: ["notifs", user.id] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);

  const unread = (query.data ?? []).filter((n) => !n.read_at).length;

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifs", user?.id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, unread, markAllRead };
}

/** Live refresh of match data (scores/status) for match pages. */
export function useLiveMatches(queryKeys: unknown[][]) {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("matches-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "matches" }, () => {
        for (const key of queryKeys) qc.invalidateQueries({ queryKey: key });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qc, JSON.stringify(queryKeys)]);
}