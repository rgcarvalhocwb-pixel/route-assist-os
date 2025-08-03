-- Tabela para dispositivos/chips de monitoramento
CREATE TABLE public.monitoring_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'intelbras_central',
  chip_number TEXT,
  operator TEXT CHECK (operator IN ('tim', 'claro', 'vivo', 'algar')),
  imei TEXT,
  device_status TEXT DEFAULT 'online' CHECK (device_status IN ('online', 'offline', 'maintenance', 'alarm')),
  last_communication TIMESTAMPTZ,
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  signal_strength INTEGER CHECK (signal_strength >= 0 AND signal_strength <= 100),
  firmware_version TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela para eventos e dados de monitoramento
CREATE TABLE public.monitoring_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.monitoring_devices(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'heartbeat', 'alarm', 'disarm', 'arm', 'zone_violation', 
    'battery_low', 'power_failure', 'signal_loss', 'maintenance',
    'gps_position', 'device_reset', 'tamper_alert'
  )),
  event_data JSONB DEFAULT '{}',
  latitude NUMERIC,
  longitude NUMERIC,
  battery_level INTEGER,
  signal_strength INTEGER,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  alert_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela para alertas configuráveis
CREATE TABLE public.monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.monitoring_devices(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  conditions JSONB NOT NULL,
  notification_methods JSONB DEFAULT '{"email": true, "sms": false}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_monitoring_devices_client_id ON public.monitoring_devices(client_id);
CREATE INDEX idx_monitoring_devices_status ON public.monitoring_devices(device_status);
CREATE INDEX idx_monitoring_events_device_id ON public.monitoring_events(device_id);
CREATE INDEX idx_monitoring_events_timestamp ON public.monitoring_events(timestamp DESC);
CREATE INDEX idx_monitoring_events_type ON public.monitoring_events(event_type);
CREATE INDEX idx_monitoring_events_processed ON public.monitoring_events(processed) WHERE processed = false;

-- RLS Policies
ALTER TABLE public.monitoring_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- Policies para monitoring_devices
CREATE POLICY "Authenticated users can view monitoring devices" 
ON public.monitoring_devices FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert monitoring devices" 
ON public.monitoring_devices FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update monitoring devices" 
ON public.monitoring_devices FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete monitoring devices" 
ON public.monitoring_devices FOR DELETE 
USING (true);

-- Policies para monitoring_events
CREATE POLICY "Authenticated users can view monitoring events" 
ON public.monitoring_events FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert monitoring events" 
ON public.monitoring_events FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update monitoring events" 
ON public.monitoring_events FOR UPDATE 
USING (true);

-- Policies para monitoring_alerts
CREATE POLICY "Authenticated users can manage monitoring alerts" 
ON public.monitoring_alerts FOR ALL 
USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_monitoring_devices_updated_at
  BEFORE UPDATE ON public.monitoring_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monitoring_alerts_updated_at
  BEFORE UPDATE ON public.monitoring_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para processar eventos automaticamente
CREATE OR REPLACE FUNCTION public.process_monitoring_event()
RETURNS TRIGGER AS $$
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

  -- Verificar se precisa gerar alertas
  -- (implementação de alertas será feita posteriormente)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para processar eventos
CREATE TRIGGER process_monitoring_event_trigger
  AFTER INSERT ON public.monitoring_events
  FOR EACH ROW
  EXECUTE FUNCTION public.process_monitoring_event();