
-- Add vehicle fields to profiles
ALTER TABLE public.profiles
ADD COLUMN vehicle_model text,
ADD COLUMN vehicle_color text,
ADD COLUMN vehicle_plate text;

-- Update the handle_new_user function to include vehicle data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, phone, vehicle_model, vehicle_color, vehicle_plate)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'vehicle_model',
      NEW.raw_user_meta_data->>'vehicle_color',
      NEW.raw_user_meta_data->>'vehicle_plate'
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client');
    
    RETURN NEW;
END;
$function$;
