import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "search_venues",
  title: "Search venues",
  description:
    "Search bookable Saudi sports venues by name, surface type, and maximum hourly price.",
  inputSchema: {
    query: z.string().optional().describe("Text to match against the venue name."),
    surface: z.string().optional(),
    max_price_per_hour: z.number().optional(),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, surface, max_price_per_hour, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    let q = supabaseForUser(ctx)
      .from("venues")
      .select("id, name_ar, name_en, slug, city_id, surface, price_per_hour, rating, is_bookable, address")
      .eq("is_approved", true)
      .limit(limit ?? 20);
    if (query) q = q.or(`name_ar.ilike.%${query}%,name_en.ilike.%${query}%`);
    if (surface) q = q.eq("surface", surface);
    if (typeof max_price_per_hour === "number") q = q.lte("price_per_hour", max_price_per_hour);
    const { data, error } = await q;
    return error ? errorResult(error.message) : textResult(data);
  },
});