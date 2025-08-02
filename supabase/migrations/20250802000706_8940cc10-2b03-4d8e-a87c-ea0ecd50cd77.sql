
-- Criar tabela para armazenar rotas
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_distance NUMERIC DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  fuel_estimate NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar tabela para paradas das rotas
CREATE TABLE public.route_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  client_name TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  estimated_time INTEGER DEFAULT 30,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  notes TEXT,
  sequence_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

-- Políticas para routes
CREATE POLICY "Users can view their own routes" 
  ON public.routes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routes" 
  ON public.routes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes" 
  ON public.routes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes" 
  ON public.routes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para route_stops
CREATE POLICY "Users can view route stops through routes" 
  ON public.route_stops 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.routes 
    WHERE routes.id = route_stops.route_id 
    AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create route stops through routes" 
  ON public.route_stops 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.routes 
    WHERE routes.id = route_stops.route_id 
    AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update route stops through routes" 
  ON public.route_stops 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.routes 
    WHERE routes.id = route_stops.route_id 
    AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete route stops through routes" 
  ON public.route_stops 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.routes 
    WHERE routes.id = route_stops.route_id 
    AND routes.user_id = auth.uid()
  ));

-- Adicionar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para routes
CREATE TRIGGER on_routes_updated
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Criar alguns dados de exemplo para service_orders e incidents se as tabelas existirem
INSERT INTO public.service_orders (client_id, service_type, status, description, scheduled_date) 
SELECT 
  c.id,
  'preventive_maintenance',
  'open',
  'Manutenção preventiva mensal',
  now() + interval '1 day'
FROM public.clients c 
LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO public.incidents (client_id, type, status, description, severity) 
SELECT 
  c.id,
  'technical_support',
  'open',
  'Suporte técnico solicitado',
  'medium'
FROM public.clients c 
LIMIT 2
ON CONFLICT DO NOTHING;
