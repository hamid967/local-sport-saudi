-- Extra indexes for common query paths
CREATE INDEX IF NOT EXISTS idx_venues_city ON public.venues(city_id);
CREATE INDEX IF NOT EXISTS idx_venues_owner ON public.venues(owner_id);
CREATE INDEX IF NOT EXISTS idx_venues_neighborhood ON public.venues(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_teams_city ON public.teams(city_id);
CREATE INDEX IF NOT EXISTS idx_teams_sport ON public.teams(sport_id);
CREATE INDEX IF NOT EXISTS idx_competitions_sport ON public.competitions(sport_id);
CREATE INDEX IF NOT EXISTS idx_standings_season ON public.standings(season_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_cities_region ON public.cities(region_id);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON public.neighborhoods(city_id);

-- Audit trigger for admin-managed tables
CREATE OR REPLACE FUNCTION public.log_admin_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row_id UUID;
BEGIN
  _row_id := COALESCE((NEW).id, (OLD).id);
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs(actor_id, action, entity_type, entity_id, meta)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      _row_id,
      jsonb_build_object('at', now())
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS audit_venues ON public.venues;
CREATE TRIGGER audit_venues
AFTER INSERT OR UPDATE OR DELETE ON public.venues
FOR EACH ROW EXECUTE FUNCTION public.log_admin_change();

DROP TRIGGER IF EXISTS audit_matches ON public.matches;
CREATE TRIGGER audit_matches
AFTER INSERT OR UPDATE OR DELETE ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.log_admin_change();

DROP TRIGGER IF EXISTS audit_competitions ON public.competitions;
CREATE TRIGGER audit_competitions
AFTER INSERT OR UPDATE OR DELETE ON public.competitions
FOR EACH ROW EXECUTE FUNCTION public.log_admin_change();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_admin_change();

DROP TRIGGER IF EXISTS audit_teams ON public.teams;
CREATE TRIGGER audit_teams
AFTER INSERT OR UPDATE OR DELETE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.log_admin_change();

-- Revoke direct execute from public; keep for authenticated so triggers on user actions work
REVOKE EXECUTE ON FUNCTION public.log_admin_change() FROM PUBLIC;