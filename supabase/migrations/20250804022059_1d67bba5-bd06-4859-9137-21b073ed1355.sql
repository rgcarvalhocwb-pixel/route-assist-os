-- Corrigir funções com search_path para segurança
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_monitoring_event()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar status do dispositivo baseado no evento
  UPDATE public.monitoring_devices 
  SET 
    last_communication = NEW.timestamp,
    device_status = CASE 
      WHEN NEW.event_type = 'alarm' THEN 'alarm'
      WHEN NEW.event_type = 'heartbeat' THEN 'online'
      WHEN NEW.event_type IN ('signal_loss', 'power_failure') THEN 'offline'
      ELSE device_status
    END,
    battery_level = COALESCE(NEW.battery_level, battery_level),
    signal_strength = COALESCE(NEW.signal_strength, signal_strength),
    updated_at = now()
  WHERE id = NEW.device_id;
  
  RETURN NEW;
END;
$$;