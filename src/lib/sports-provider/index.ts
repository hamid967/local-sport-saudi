/**
 * Sports data provider adapter.
 * Current implementation reads from our own Supabase DB.
 * To swap in a licensed feed later, implement this interface and export it here.
 */
import { supabase } from "@/integrations/supabase/client";

export type MatchRow = {
  id: string;
  kickoff_at: string;
  status: "scheduled" | "live" | "halftime" | "finished" | "postponed" | "cancelled";
  minute: number | null;
  home_score: number;
  away_score: number;
  matchday: number | null;
  home_team: { id: string; name_ar: string; name_en: string; slug: string; color: string | null } | null;
  away_team: { id: string; name_ar: string; name_en: string; slug: string; color: string | null } | null;
  competition: { id: string; name_ar: string; name_en: string; slug: string } | null;
  venue: { id: string; name_ar: string; name_en: string } | null;
};

const matchSelect = `
  id, kickoff_at, status, minute, home_score, away_score, matchday,
  home_team:home_team_id ( id, name_ar, name_en, slug, color ),
  away_team:away_team_id ( id, name_ar, name_en, slug, color ),
  competition:competition_id ( id, name_ar, name_en, slug ),
  venue:venue_id ( id, name_ar, name_en )
` as const;

export const sportsProvider = {
  async getMatchesInRange(from: Date, to: Date, filters: { competition?: string; team?: string } = {}) {
    let q = supabase
      .from("matches")
      .select(matchSelect)
      .gte("kickoff_at", from.toISOString())
      .lte("kickoff_at", to.toISOString())
      .order("kickoff_at", { ascending: true });
    if (filters.competition) q = q.eq("competition_id", filters.competition);
    if (filters.team)
      q = q.or(`home_team_id.eq.${filters.team},away_team_id.eq.${filters.team}`);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as unknown as MatchRow[];
  },
  async getLiveMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select(matchSelect)
      .in("status", ["live", "halftime"])
      .order("kickoff_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as MatchRow[];
  },
  async getMatch(id: string) {
    const { data, error } = await supabase.from("matches").select(matchSelect).eq("id", id).single();
    if (error) throw error;
    return data as unknown as MatchRow;
  },
  async getMatchEvents(id: string) {
    const { data, error } = await supabase
      .from("match_events")
      .select("id, event_type, minute, detail, team:team_id(id, name_ar, name_en), player:player_id(id, full_name_ar, full_name_en)")
      .eq("match_id", id)
      .order("minute", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};
