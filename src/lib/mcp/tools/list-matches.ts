import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_matches",
  title: "List matches",
  description:
    "List Saudi football matches with optional status filter (live, scheduled, finished) and date range.",
  inputSchema: {
    status: z.enum(["scheduled", "live", "finished", "postponed", "cancelled"]).optional(),
    from: z.string().optional().describe("ISO date/time lower bound for kickoff."),
    to: z.string().optional().describe("ISO date/time upper bound for kickoff."),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, from, to, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    let q = supabaseForUser(ctx)
      .from("matches")
      .select(
        "id, kickoff_at, status, minute, home_score, away_score, home_team_id, away_team_id, competition_id",
      )
      .order("kickoff_at", { ascending: true })
      .limit(limit ?? 20);
    if (status) q = q.eq("status", status);
    if (from) q = q.gte("kickoff_at", from);
    if (to) q = q.lte("kickoff_at", to);
    const { data, error } = await q;
    return error ? errorResult(error.message) : textResult(data);
  },
});