import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_my_bookings",
  title: "List my bookings",
  description: "List the signed-in user's venue bookings, newest first.",
  inputSchema: { limit: z.number().int().min(1).max(50).optional() },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("bookings")
      .select("id, venue_id, start_at, end_at, status, total_price, notes")
      .eq("user_id", ctx.getUserId()!)
      .order("start_at", { ascending: false })
      .limit(limit ?? 20);
    return error ? errorResult(error.message) : textResult(data);
  },
});