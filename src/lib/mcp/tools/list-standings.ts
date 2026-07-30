import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_standings",
  title: "List standings",
  description: "Return the league table rows for a competition season.",
  inputSchema: {
    season_id: z.string().uuid().optional(),
    competition_id: z.string().uuid().optional(),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ season_id, competition_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    let q = supabaseForUser(ctx).from("standings").select("*").limit(limit ?? 30);
    if (season_id) q = q.eq("season_id", season_id);
    if (competition_id) q = q.eq("competition_id", competition_id);
    const { data, error } = await q;
    return error ? errorResult(error.message) : textResult(data);
  },
});