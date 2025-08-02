
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Calendar, User, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import { CreateServiceOrderModal } from '@/components/service-orders/CreateServiceOrderModal';
import { ServiceOrderDetails } from '@/components/service-orders/ServiceOrderDetails';
import { supabase } from '@/integrations/supabase/client';

interface ServiceOrder {
  id: string;
  client_id: string;
  service_type: string;
  status: string;
  description?: string;
  scheduled_date?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  photos?: string[];
  client_signature?: string;
  technician_id?: string;
  clients?: {
    name: string;
    address: string;
  };
  profiles?: {
    name: string;
  };
}

const ServiceOrders = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServiceOrders();
  }, []);

  const fetchServiceOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          clients (
            name,
            address
          ),
          profiles (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar ordens de serviço:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar ordens de serviço",
        description: error.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: 'Aberta', variant: 'default' as const },
      in_progress: { label: 'Em Andamento', variant: 'secondary' as const },
      completed: { label: 'Concluída', variant: 'outline' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getServiceTypeBadge = (type: string) => {
    const typeMap = {
      installation: { label: 'Instalação', color: 'bg-blue-100 text-blue-800' },
      preventive_maintenance: { label: 'Manutenção Preventiva', color: 'bg-yellow-100 text-yellow-800' },
      corrective_maintenance: { label: 'Manutenção Corretiva', color: 'bg-green-100 text-green-800' },
      inspection: { label: 'Inspeção', color: 'bg-purple-100 text-purple-800' }
    };
    
    const config = typeMap[type as keyof typeof typeMap] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && order.status === activeTab;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando ordens de serviço...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie e acompanhe todas as ordens de serviço
            </p>
          </div>
          <CreateServiceOrderModal onOrderCreated={fetchServiceOrders} />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abertas</CardTitle>
              <ClipboardList className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.status === 'open').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <User className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.status === 'in_progress').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <Calendar className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.status === 'completed').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <ClipboardList className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative flex-1 mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar ordens de serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Orders Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="open">Abertas</TabsTrigger>
            <TabsTrigger value="in_progress">Em Andamento</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {order.clients?.name || 'Cliente não encontrado'}
                          {getStatusBadge(order.status)}
                        </CardTitle>
                        <CardDescription>
                          {order.clients?.address}
                          {order.profiles && (
                            <span className="ml-2 text-xs">
                              • Técnico: {order.profiles.name}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getServiceTypeBadge(order.service_type)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {order.description && (
                      <p className="text-sm text-muted-foreground mb-3">{order.description}</p>
                    )}
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>
                        Criada em: {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {order.scheduled_date && (
                        <span>
                          Agendada para: {new Date(order.scheduled_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    {order.photos && order.photos.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          📷 {order.photos.length} foto(s) anexada(s)
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {filteredOrders.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma ordem encontrada</h3>
                    <p className="text-muted-foreground text-center">
                      {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Crie sua primeira ordem de serviço.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <ServiceOrderDetails
          order={selectedOrder}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onOrderUpdated={fetchServiceOrders}
        />
      </div>
    </AppLayout>
  );
};

export default ServiceOrders;
