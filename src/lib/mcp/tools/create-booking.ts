import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "create_booking",
  title: "Create venue booking",
  description:
    "Book a venue for the signed-in user for a given time range. Fails if the slot is already taken.",
  inputSchema: {
    venue_id: z.string().uuid(),
    start_at: z.string().describe("ISO start datetime."),
    end_at: z.string().describe("ISO end datetime."),
    notes: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ venue_id, start_at, end_at, notes }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx).rpc("create_booking", {
      _venue_id: venue_id,
      _start: start_at,
      _end: end_at,
      _notes: notes ?? "",
    });
    return error ? errorResult(error.message) : textResult({ booking_id: data });
  },
});