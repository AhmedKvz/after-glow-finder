-- Fix security warning: set search_path for function
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.xp >= 10000 THEN
    NEW.level := 'Legend';
  ELSIF NEW.xp >= 5000 THEN
    NEW.level := 'VIP';
  ELSIF NEW.xp >= 2000 THEN
    NEW.level := 'Pro';
  ELSIF NEW.xp >= 1000 THEN
    NEW.level := 'Regular';
  ELSIF NEW.xp >= 500 THEN
    NEW.level := 'Rising Star';
  ELSIF NEW.xp >= 100 THEN
    NEW.level := 'Explorer';
  ELSE
    NEW.level := 'Newbie';
  END IF;
  RETURN NEW;
END;
$$;