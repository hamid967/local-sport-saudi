-- Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.matches; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Booking notifications (user + venue owner)
CREATE OR REPLACE FUNCTION public.notify_booking_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _venue_name TEXT;
  _owner UUID;
BEGIN
  SELECT name_ar, owner_id INTO _venue_name, _owner FROM public.venues WHERE id = NEW.venue_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (NEW.user_id, 'booking', 'تم تأكيد حجزك',
      'حجزك في ' || COALESCE(_venue_name,'الملعب') || ' بتاريخ ' || to_char(NEW.start_at, 'YYYY-MM-DD HH24:MI'),
      '/bookings');
    IF _owner IS NOT NULL AND _owner <> NEW.user_id THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (_owner, 'booking', 'حجز جديد على ملعبك',
        COALESCE(_venue_name,'ملعبك') || ' — ' || to_char(NEW.start_at, 'YYYY-MM-DD HH24:MI'), '/owner');
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications(user_id, type, title, body, link)
    VALUES (NEW.user_id, 'booking',
      CASE NEW.status WHEN 'cancelled' THEN 'تم إلغاء حجزك' WHEN 'completed' THEN 'اكتمل حجزك' ELSE 'تحديث حالة الحجز' END,
      COALESCE(_venue_name,'الملعب') || ' — ' || to_char(NEW.start_at, 'YYYY-MM-DD HH24:MI'), '/bookings');
    IF _owner IS NOT NULL AND _owner <> NEW.user_id THEN
      INSERT INTO public.notifications(user_id, type, title, body, link)
      VALUES (_owner, 'booking', 'تحديث حجز على ملعبك',
        COALESCE(_venue_name,'ملعبك') || ' — ' || NEW.status::text, '/owner');
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_booking ON public.bookings;
CREATE TRIGGER trg_notify_booking
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_booking_change();

-- Match status notifications for users who favorited a team
CREATE OR REPLACE FUNCTION public.notify_match_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _home TEXT; _away TEXT; _title TEXT;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('live','finished') THEN RETURN NEW; END IF;

  SELECT name_ar INTO _home FROM public.teams WHERE id = NEW.home_team_id;
  SELECT name_ar INTO _away FROM public.teams WHERE id = NEW.away_team_id;
  _title := CASE WHEN NEW.status = 'live' THEN 'انطلقت المباراة' ELSE 'انتهت المباراة' END;

  INSERT INTO public.notifications(user_id, type, title, body, link)
  SELECT DISTINCT f.user_id, 'match', _title,
    COALESCE(_home,'') || ' ' || COALESCE(NEW.home_score,0) || ' - ' || COALESCE(NEW.away_score,0) || ' ' || COALESCE(_away,''),
    '/matches/' || NEW.id
  FROM public.favorites f
  WHERE f.entity_type = 'team' AND f.entity_id IN (NEW.home_team_id, NEW.away_team_id);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_match_status ON public.matches;
CREATE TRIGGER trg_notify_match_status
AFTER UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.notify_match_status();

REVOKE EXECUTE ON FUNCTION public.notify_booking_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_match_status() FROM anon, authenticated;

-- Booking cancellation only before start
CREATE OR REPLACE FUNCTION public.enforce_booking_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled'
     AND NOT public.is_admin(auth.uid())
     AND OLD.start_at <= now() THEN
    RAISE EXCEPTION 'cannot cancel a booking after it has started';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_booking_update ON public.bookings;
CREATE TRIGGER trg_enforce_booking_update
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_update();