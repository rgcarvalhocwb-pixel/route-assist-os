import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Route, Clock, Fuel, Plus, Search, Navigation, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import CreateRouteModal from '@/components/routes/CreateRouteModal';

interface RouteStop {
  id: string;
  address: string;
  client_name: string;
  lat: number;
  lng: number;
  estimated_time: number;
  status: 'pending' | 'completed' | 'in_progress';
  notes?: string;
}

interface OptimizedRoute {
  id: string;
  name: string;
  stops: RouteStop[];
  total_distance: number;
  total_time: number;
  fuel_estimate: number;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
}

const Routes = () => {
  const [routes, setRoutes] = useState<OptimizedRoute[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  // Mock data para demonstração
  useEffect(() => {
    const mockRoutes: OptimizedRoute[] = [
      {
        id: '1',
        name: 'Rota Centro - Manhã',
        stops: [
          {
            id: '1',
            address: 'Rua das Flores, 123 - Centro',
            client_name: 'Cliente A',
            lat: -23.550520,
            lng: -46.633309,
            estimated_time: 30,
            status: 'completed'
          },
          {
            id: '2',
            address: 'Av. Paulista, 456 - Bela Vista',
            client_name: 'Cliente B',
            lat: -23.561684,
            lng: -46.656139,
            estimated_time: 45,
            status: 'in_progress'
          },
          {
            id: '3',
            address: 'Rua Augusta, 789 - Consolação',
            client_name: 'Cliente C',
            lat: -23.553618,
            lng: -46.662282,
            estimated_time: 20,
            status: 'pending'
          }
        ],
        total_distance: 15.5,
        total_time: 95,
        fuel_estimate: 2.3,
        status: 'active',
        created_at: '2024-01-20T08:00:00Z'
      },
      {
        id: '2',
        name: 'Rota Zona Sul - Tarde',
        stops: [
          {
            id: '4',
            address: 'Rua Domingos de Morais, 321 - Vila Mariana',
            client_name: 'Cliente D',
            lat: -23.588849,
            lng: -46.638291,
            estimated_time: 40,
            status: 'pending'
          },
          {
            id: '5',
            address: 'Av. Ibirapuera, 654 - Ibirapuera',
            client_name: 'Cliente E',
            lat: -23.573851,
            lng: -46.659524,
            estimated_time: 35,
            status: 'pending'
          }
        ],
        total_distance: 12.2,
        total_time: 75,
        fuel_estimate: 1.8,
        status: 'draft',
        created_at: '2024-01-20T14:00:00Z'
      }
    ];
    setRoutes(mockRoutes);
  }, []);

  const handleRouteCreated = (newRoute: OptimizedRoute) => {
    setRoutes(prev => [newRoute, ...prev]);
  };

  const handleOptimizeRoute = async (routeId: string) => {
    setIsOptimizing(true);
    try {
      // Simula otimização da rota
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRoutes(prev => prev.map(route => {
        if (route.id === routeId) {
          return {
            ...route,
            total_distance: route.total_distance * 0.85, // Redução de 15% na distância
            total_time: route.total_time * 0.9, // Redução de 10% no tempo
            fuel_estimate: route.fuel_estimate * 0.85 // Redução de 15% no combustível
          };
        }
        return route;
      }));

      toast({
        title: "Rota otimizada!",
        description: "A rota foi otimizada com sucesso. Economia de tempo e combustível aplicada.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao otimizar",
        description: "Não foi possível otimizar a rota. Tente novamente.",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      active: { label: 'Ativa', variant: 'default' as const },
      completed: { label: 'Concluída', variant: 'outline' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStopStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      in_progress: { label: 'Em Andamento', variant: 'default' as const },
      completed: { label: 'Concluída', variant: 'outline' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.stops.some(stop => 
                           stop.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stop.address.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && route.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Rotas</h1>
            <p className="text-muted-foreground mt-2">
              Otimize rotas, economize tempo e combustível
            </p>
          </div>
          <Button 
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Rota
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rotas Ativas</CardTitle>
              <Route className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routes.filter(r => r.status === 'active').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paradas Hoje</CardTitle>
              <MapPin className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {routes.reduce((acc, route) => acc + route.stops.length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              <Clock className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(routes.reduce((acc, route) => acc + route.total_time, 0) / 60)}h
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Combustível</CardTitle>
              <Fuel className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {routes.reduce((acc, route) => acc + route.fuel_estimate, 0).toFixed(1)}L
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar rotas, clientes ou endereços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Routes Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="draft">Rascunhos</TabsTrigger>
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-6">
              {filteredRoutes.map((route) => (
                <Card key={route.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {route.name}
                          {getStatusBadge(route.status)}
                        </CardTitle>
                        <CardDescription>
                          {route.stops.length} paradas • {route.total_distance.toFixed(1)} km • {Math.round(route.total_time)} min
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptimizeRoute(route.id)}
                          disabled={isOptimizing}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {isOptimizing ? 'Otimizando...' : 'Otimizar'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Navigation className="h-4 w-4 mr-2" />
                          Navegar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {route.stops.map((stop, index) => (
                        <div key={stop.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{stop.client_name}</p>
                              <p className="text-xs text-muted-foreground">{stop.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{stop.estimated_time} min</span>
                            {getStopStatusBadge(stop.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>🛣️ {route.total_distance.toFixed(1)} km</span>
                        <span>⏱️ {Math.round(route.total_time)} min</span>
                        <span>⛽ {route.fuel_estimate.toFixed(1)}L</span>
                      </div>
                      <Badge variant="outline">
                        {new Date(route.created_at).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredRoutes.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Route className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma rota encontrada</h3>
                    <p className="text-muted-foreground text-center">
                      {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Crie sua primeira rota para começar.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <CreateRouteModal 
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onRouteCreated={handleRouteCreated}
        />
      </div>
    </div>
  );
};

export default Routes;