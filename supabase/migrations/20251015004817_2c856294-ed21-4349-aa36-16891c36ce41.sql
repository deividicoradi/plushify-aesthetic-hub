-- Adjust appointment confirmation rules: allow confirming without requiring working hours, but still prevent overlaps

-- 1) Drop existing availability validation triggers on appointments (if any)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE n.nspname = 'public'
      AND c.relname = 'appointments'
      AND t.tgenabled <> 'D'
      AND NOT t.tgisinternal
      AND (
        p.proname ILIKE '%availability%'
        OR p.proname ILIKE '%validate%appointment%'
        OR t.tgname ILIKE '%availability%'
        OR t.tgname ILIKE '%validate%'
      )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.appointments;', r.tgname);
  END LOOP;
END $$;

-- 2) Create a new validation function that:
--    - On INSERT: enforces working hours + conflict checks (using existing function)
--    - On UPDATE of date/time/duration: enforces full check again
--    - On UPDATE of only status to 'confirmado': enforce only conflict check (ignore working hours)
CREATE OR REPLACE FUNCTION public.validate_appointments_before_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conflict_count INTEGER := 0;
  new_end_time TIME;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.check_appointment_availability(NEW.user_id, NEW.appointment_date, NEW.appointment_time, NEW.duration, NULL) THEN
      RAISE EXCEPTION 'Horário não disponível. Verifique conflitos ou horário de trabalho.';
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If date/time/duration changed, run full availability validation (including working hours)
    IF (NEW.appointment_date IS DISTINCT FROM OLD.appointment_date)
       OR (NEW.appointment_time IS DISTINCT FROM OLD.appointment_time)
       OR (NEW.duration IS DISTINCT FROM OLD.duration) THEN
      IF NOT public.check_appointment_availability(NEW.user_id, NEW.appointment_date, NEW.appointment_time, NEW.duration, NEW.id) THEN
        RAISE EXCEPTION 'Horário não disponível. Verifique conflitos ou horário de trabalho.';
      END IF;
      RETURN NEW;
    END IF;

    -- If only status is changing to confirmado, verify only conflicts, ignore working hours
    IF NEW.status = 'confirmado' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
      new_end_time := (NEW.appointment_time + (NEW.duration || ' minutes')::INTERVAL)::TIME;
      SELECT COUNT(*) INTO conflict_count
      FROM public.appointments a
      WHERE a.user_id = NEW.user_id
        AND a.id <> NEW.id
        AND a.appointment_date = NEW.appointment_date
        AND a.status <> 'cancelado'
        AND (
          (NEW.appointment_time >= a.appointment_time AND NEW.appointment_time < (a.appointment_time + (a.duration || ' minutes')::INTERVAL))
          OR (new_end_time > a.appointment_time AND new_end_time <= (a.appointment_time + (a.duration || ' minutes')::INTERVAL))
          OR (NEW.appointment_time <= a.appointment_time AND new_end_time >= (a.appointment_time + (a.duration || ' minutes')::INTERVAL))
        );
      IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Horário em conflito com outro agendamento.';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Recreate trigger using the new function
DROP TRIGGER IF EXISTS validate_appointments_before_change ON public.appointments;
CREATE TRIGGER validate_appointments_before_change
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.validate_appointments_before_change();