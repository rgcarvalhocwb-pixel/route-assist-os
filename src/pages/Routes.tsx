import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MapPin, Route, Clock, Fuel, Plus, Search, Navigation, Zap, MoreVertical, Play, Pause, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import CsvImporter from '@/components/common/CsvImporter';
import CreateRouteModal from '@/components/routes/CreateRouteModal';
import { useRoutes } from '@/hooks/useRoutes';

const Routes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { routes, loading, createRoute, updateRouteStatus, optimizeRoute, deleteRoute } = useRoutes();

  const sampleRouteData = [
    {
      name: 'Rota Centro',
      description: 'Rota de atendimento no centro da cidade',
      client_name_1: 'Empresa ABC',
      address_1: 'Rua das Flores, 123',
      notes_1: 'Verificação de portaria',
      client_name_2: 'Loja XYZ',
      address_2: 'Av. Principal, 456',
      notes_2: 'Ronda noturna',
      client_name_3: 'Escritório DEF',
      address_3: 'Rua Comercial, 789',
      notes_3: 'Monitoramento de alarmes'
    }
  ];

  const handleImportRoutes = async (data: Record<string, any>[]) => {
    try {
      for (const row of data) {
        const stops = [];
        
        // Extrair paradas do CSV (até 10 paradas por rota)
        for (let i = 1; i <= 10; i++) {
          const clientName = row[`client_name_${i}`];
          const address = row[`address_${i}`];
          
          if (clientName && address) {
            stops.push({
              client_name: clientName,
              address: address,
              notes: row[`notes_${i}`] || ''
            });
          }
        }

        if (stops.length > 0) {
          await createRoute({
            name: row.name,
            description: row.description || '',
            stops
          });
        }
      }
    } catch (error: any) {
      console.error('Erro ao importar rotas:', error);
      throw new Error(error.message || 'Erro ao importar rotas');
    }
  };

  const handleRouteCreated = async (routeData: any) => {
    await createRoute(routeData);
    setShowCreateModal(false);
  };

  const handleOptimizeRoute = async (routeId: string) => {
    setIsOptimizing(routeId);
    try {
      await optimizeRoute(routeId);
    } finally {
      setIsOptimizing(null);
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
                         (route.stops || []).some(stop => 
                           stop.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stop.address.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && route.status === activeTab;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando rotas...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Rotas</h1>
            <p className="text-muted-foreground mt-2">
              Otimize rotas, economize tempo e combustível
            </p>
          </div>
          <div className="flex gap-2">
            <CsvImporter
              title="Importar Rotas"
              description="Importe rotas em lote usando um arquivo CSV"
              sampleData={sampleRouteData}
              onImport={handleImportRoutes}
              requiredFields={['name', 'client_name_1', 'address_1']}
              filename="rotas"
            />
            <Button 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Rota
            </Button>
          </div>
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
                {routes.reduce((acc, route) => acc + (route.stops?.length || 0), 0)}
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
                          {route.stops?.length || 0} paradas • {route.total_distance.toFixed(1)} km • {Math.round(route.total_time)} min
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOptimizeRoute(route.id)}
                          disabled={isOptimizing === route.id}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {isOptimizing === route.id ? 'Otimizando...' : 'Otimizar'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Navigation className="h-4 w-4 mr-2" />
                          Navegar
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {route.status === 'draft' && (
                              <DropdownMenuItem onClick={() => updateRouteStatus(route.id, 'active')}>
                                <Play className="h-4 w-4 mr-2" />
                                Ativar Rota
                              </DropdownMenuItem>
                            )}
                            {route.status === 'active' && (
                              <DropdownMenuItem onClick={() => updateRouteStatus(route.id, 'completed')}>
                                <Pause className="h-4 w-4 mr-2" />
                                Finalizar Rota
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => deleteRoute(route.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Rota
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(route.stops || []).map((stop, index) => (
                        <div key={stop.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{stop.client_name}</p>
                              <p className="text-xs text-muted-foreground">{stop.address}</p>
                              {stop.notes && (
                                <p className="text-xs text-muted-foreground italic">Obs: {stop.notes}</p>
                              )}
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
    </AppLayout>
  );
};

export default Routes;
