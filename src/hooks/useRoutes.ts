
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RouteStop {
  id: string;
  route_id: string;
  client_id?: string;
  address: string;
  client_name: string;
  latitude?: number;
  longitude?: number;
  estimated_time: number;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
  sequence_order: number;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  total_distance: number;
  total_time: number;
  fuel_estimate: number;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
  user_id?: string;
  stops?: RouteStop[];
}

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (routesError) throw routesError;

      // Buscar paradas para cada rota
      const routesWithStops = await Promise.all(
        routesData.map(async (route) => {
          const { data: stopsData, error: stopsError } = await supabase
            .from('route_stops')
            .select('*')
            .eq('route_id', route.id)
            .order('sequence_order', { ascending: true });

          if (stopsError) throw stopsError;

          return {
            ...route,
            stops: stopsData || []
          };
        })
      );

      setRoutes(routesWithStops);
    } catch (error: any) {
      console.error('Erro ao buscar rotas:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar rotas",
        description: error.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async (routeData: {
    name: string;
    description?: string;
    stops: Array<{
      address: string;
      client_name: string;
      notes?: string;
    }>;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Criar a rota
      const { data: newRoute, error: routeError } = await supabase
        .from('routes')
        .insert({
          name: routeData.name,
          description: routeData.description,
          user_id: user.id,
          total_distance: routeData.stops.length * 3.5 + Math.random() * 5,
          total_time: routeData.stops.length * 25 + Math.floor(Math.random() * 30),
          fuel_estimate: routeData.stops.length * 0.8 + Math.random(),
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Criar as paradas
      if (routeData.stops.length > 0) {
        const stopsToInsert = routeData.stops.map((stop, index) => ({
          route_id: newRoute.id,
          address: stop.address,
          client_name: stop.client_name,
          notes: stop.notes,
          sequence_order: index + 1,
          latitude: -23.550520 + (Math.random() - 0.5) * 0.1,
          longitude: -46.633309 + (Math.random() - 0.5) * 0.1,
          estimated_time: 20 + Math.floor(Math.random() * 40),
        }));

        const { error: stopsError } = await supabase
          .from('route_stops')
          .insert(stopsToInsert);

        if (stopsError) throw stopsError;
      }

      await fetchRoutes();
      
      toast({
        title: "Rota criada!",
        description: `A rota "${routeData.name}" foi criada com ${routeData.stops.length} paradas.`,
      });

      return newRoute;
    } catch (error: any) {
      console.error('Erro ao criar rota:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar rota",
        description: error.message || "Não foi possível criar a rota",
      });
      throw error;
    }
  };

  const updateRouteStatus = async (routeId: string, status: 'draft' | 'active' | 'completed') => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({ status })
        .eq('id', routeId);

      if (error) throw error;

      await fetchRoutes();
      
      toast({
        title: "Status atualizado!",
        description: `Status da rota alterado para ${status}.`,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message || "Não foi possível atualizar o status",
      });
    }
  };

  const optimizeRoute = async (routeId: string) => {
    try {
      // Simular otimização
      const route = routes.find(r => r.id === routeId);
      if (!route) return;

      const optimizedDistance = route.total_distance * 0.85;
      const optimizedTime = route.total_time * 0.9;
      const optimizedFuel = route.fuel_estimate * 0.85;

      const { error } = await supabase
        .from('routes')
        .update({
          total_distance: optimizedDistance,
          total_time: optimizedTime,
          fuel_estimate: optimizedFuel,
        })
        .eq('id', routeId);

      if (error) throw error;

      await fetchRoutes();
      
      toast({
        title: "Rota otimizada!",
        description: "A rota foi otimizada com sucesso. Economia de tempo e combustível aplicada.",
      });
    } catch (error: any) {
      console.error('Erro ao otimizar rota:', error);
      toast({
        variant: "destructive",
        title: "Erro ao otimizar",
        description: error.message || "Não foi possível otimizar a rota",
      });
    }
  };

  const deleteRoute = async (routeId: string) => {
    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);

      if (error) throw error;

      await fetchRoutes();
      
      toast({
        title: "Rota excluída!",
        description: "A rota foi excluída com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao excluir rota:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a rota",
      });
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return {
    routes,
    loading,
    createRoute,
    updateRouteStatus,
    optimizeRoute,
    deleteRoute,
    refetch: fetchRoutes,
  };
};
