import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, MapPin, Shield, AlertTriangle, Map } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import CsvImporter from '@/components/common/CsvImporter';
import { CreateClientModal } from '@/components/clients/CreateClientModal';
import { useClients } from '@/hooks/useClients';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { supabase } from '@/integrations/supabase/client';
import GoogleMapsWrapper from '@/components/maps/GoogleMapsWrapper';
import ClientMap from '@/components/maps/ClientMap';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showMap, setShowMap] = useState(false);
  const { clients, loading, refetch } = useClients();
  const { apiKey, configured } = useGoogleMaps();

  const sampleClientData = [
    {
      name: 'Empresa ABC Ltda',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      risk_level: 'medium',
      alarm_chip: 'CHIP001',
      zins_account: 'ZINS123',
      client_routine: 'Verificação diária às 8h e 18h',
      monitored_areas: 'Portaria principal, Estacionamento'
    },
    {
      name: 'Comércio XYZ',
      address: 'Av. Principal, 456 - Rio de Janeiro, RJ',
      risk_level: 'high',
      alarm_chip: 'CHIP002',
      zins_account: 'ZINS456',
      client_routine: 'Ronda a cada 2 horas',
      monitored_areas: 'Loja, Depósito, Escritório'
    }
  ];

  const handleImportClients = async (data: Record<string, any>[]) => {
    try {
      const clientsToInsert = data.map(row => ({
        name: row.name,
        address: row.address,
        risk_level: row.risk_level,
        alarm_chip: row.alarm_chip || null,
        zins_account: row.zins_account || null,
        client_routine: row.client_routine || null,
        monitored_areas: row.monitored_areas || null,
        latitude: row.latitude ? parseFloat(row.latitude) : null,
        longitude: row.longitude ? parseFloat(row.longitude) : null,
      }));

      const { error } = await supabase
        .from('clients')
        .insert(clientsToInsert);

      if (error) throw error;

      await refetch();
    } catch (error: any) {
      console.error('Erro ao importar clientes:', error);
      throw new Error(error.message || 'Erro ao importar clientes');
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const riskMap = {
      low: { label: 'Baixo', variant: 'secondary' as const },
      medium: { label: 'Médio', variant: 'default' as const },
      high: { label: 'Alto', variant: 'destructive' as const },
      critical: { label: 'Crítico', variant: 'destructive' as const }
    };
    
    const config = riskMap[riskLevel as keyof typeof riskMap] || riskMap.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && client.risk_level === activeTab;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando clientes...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie informações dos clientes e níveis de risco
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              {showMap ? 'Lista' : 'Mapa'}
            </Button>
            <CsvImporter
              title="Importar Clientes"
              description="Importe clientes em lote usando um arquivo CSV"
              sampleData={sampleClientData}
              onImport={handleImportClients}
              requiredFields={['name', 'address', 'risk_level']}
              filename="clientes"
            />
            <CreateClientModal onClientCreated={refetch} />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risco Alto/Crítico</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => ['high', 'critical'].includes(c.risk_level)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Localização</CardTitle>
              <MapPin className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.latitude && c.longitude).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Chip Alarme</CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.alarm_chip).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Map View */}
        {showMap && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Mapa dos Clientes</CardTitle>
              <CardDescription>
                Visualização geográfica dos clientes com coordenadas cadastradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleMapsWrapper apiKey={apiKey}>
                <ClientMap 
                  clients={filteredClients}
                  height="500px"
                />
              </GoogleMapsWrapper>
            </CardContent>
          </Card>
        )}

        {/* Clients Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="low">Risco Baixo</TabsTrigger>
            <TabsTrigger value="medium">Risco Médio</TabsTrigger>
            <TabsTrigger value="high">Risco Alto</TabsTrigger>
            <TabsTrigger value="critical">Crítico</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-6">
              {filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {client.name}
                          {getRiskBadge(client.risk_level)}
                        </CardTitle>
                        <CardDescription>{client.address}</CardDescription>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {client.alarm_chip && (
                          <Badge variant="outline">Chip: {client.alarm_chip}</Badge>
                        )}
                        {client.zins_account && (
                          <Badge variant="outline">ZINS: {client.zins_account}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {client.client_routine && (
                        <div>
                          <strong>Rotina:</strong> {client.client_routine}
                        </div>
                      )}
                      {client.monitored_areas && (
                        <div>
                          <strong>Áreas Monitoradas:</strong> {client.monitored_areas}
                        </div>
                      )}
                      {client.latitude && client.longitude && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {client.latitude}, {client.longitude}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredClients.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
                    <p className="text-muted-foreground text-center">
                      {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Cadastre o primeiro cliente para começar.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Clients;
