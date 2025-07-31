import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ClipboardList, AlertTriangle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalClients: number;
  activeServiceOrders: number;
  openIncidents: number;
  completedThisMonth: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeServiceOrders: 0,
    openIncidents: 0,
    completedThisMonth: 0,
  });
  const [recentServiceOrders, setRecentServiceOrders] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const [clientsResult, serviceOrdersResult, incidentsResult] = await Promise.all([
        supabase.from('clients').select('id'),
        supabase.from('service_orders').select('id, status'),
        supabase.from('incidents').select('id, status'),
      ]);

      const totalClients = clientsResult.data?.length || 0;
      const activeServiceOrders = serviceOrdersResult.data?.filter(so => 
        so.status === 'open' || so.status === 'in_progress'
      ).length || 0;
      const openIncidents = incidentsResult.data?.filter(inc => 
        inc.status === 'open' || inc.status === 'in_progress'
      ).length || 0;

      // Count completed service orders this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const completedResult = await supabase
        .from('service_orders')
        .select('id')
        .eq('status', 'completed')
        .gte('completed_at', startOfMonth.toISOString());

      const completedThisMonth = completedResult.data?.length || 0;

      setStats({
        totalClients,
        activeServiceOrders,
        openIncidents,
        completedThisMonth,
      });

      // Load recent service orders
      const recentSOResult = await supabase
        .from('service_orders')
        .select(`
          id,
          service_type,
          status,
          scheduled_date,
          clients (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentServiceOrders(recentSOResult.data || []);

      // Load recent incidents
      const recentIncResult = await supabase
        .from('incidents')
        .select(`
          id,
          type,
          status,
          severity,
          created_at,
          clients (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentIncidents(recentIncResult.data || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: 'Aberta', variant: 'destructive' as const },
      in_progress: { label: 'Em Andamento', variant: 'default' as const },
      completed: { label: 'Concluída', variant: 'secondary' as const },
      resolved: { label: 'Resolvida', variant: 'secondary' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getServiceTypeLabel = (type: string) => {
    const typeMap = {
      preventive_maintenance: 'Manutenção Preventiva',
      corrective_maintenance: 'Manutenção Corretiva',
      installation: 'Instalação',
      inspection: 'Inspeção',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getIncidentTypeLabel = (type: string) => {
    const typeMap = {
      invasion_detected: 'Invasão Detectada',
      power_failure: 'Queda de Energia',
      communication_failure: 'Falha de Comunicação',
      maintenance_pending: 'Manutenção Pendente',
      technical_support: 'Suporte Técnico',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OS Ativas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeServiceOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocorrências Abertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openIncidents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas Este Mês</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Service Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço Recentes</CardTitle>
            <CardDescription>Últimas 5 ordens criadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentServiceOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
              ) : (
                recentServiceOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{order.clients?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getServiceTypeLabel(order.service_type)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      {order.scheduled_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.scheduled_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/service-orders')}
            >
              Ver Todas as OS
            </Button>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Ocorrências Recentes</CardTitle>
            <CardDescription>Últimas 5 ocorrências registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma ocorrência encontrada</p>
              ) : (
                recentIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{incident.clients?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getIncidentTypeLabel(incident.type)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(incident.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(incident.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/incidents')}
            >
              Ver Todas as Ocorrências
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;