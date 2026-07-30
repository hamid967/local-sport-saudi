import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMatches from "./tools/list-matches";
import listStandings from "./tools/list-standings";
import searchVenues from "./tools/search-venues";
import listMyBookings from "./tools/list-my-bookings";
import createBooking from "./tools/create-booking";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "saudi-sport-hub",
  title: "Saudi Sport Hub",
  version: "0.1.0",
  instructions:
    "Tools for the Saudi local sports platform: browse matches and standings, search bookable venues, and manage the signed-in user's venue bookings. All sports data is fictional demo data.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMatches, listStandings, searchVenues, listMyBookings, createBooking],
});