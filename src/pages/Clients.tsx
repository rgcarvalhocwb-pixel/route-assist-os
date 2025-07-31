import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, MapPin, Phone, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  zins_account?: string;
  alarm_chip?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  monitored_areas?: string;
  created_at: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar clientes",
          description: error.message,
        });
        return;
      }

      setClients(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.zins_account?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskLevelBadge = (level: string) => {
    const levelMap = {
      low: { label: 'Baixo', variant: 'secondary' as const },
      medium: { label: 'Médio', variant: 'default' as const },
      high: { label: 'Alto', variant: 'destructive' as const },
      critical: { label: 'Crítico', variant: 'destructive' as const },
    };
    
    const levelInfo = levelMap[level as keyof typeof levelMap] || { label: level, variant: 'outline' as const };
    return <Badge variant={levelInfo.variant}>{levelInfo.label}</Badge>;
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
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie os clientes e suas informações</p>
        </div>
        <Button onClick={() => navigate('/clients/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes por nome, endereço ou conta ZINS..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Total de Clientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {clients.filter(c => c.risk_level === 'high' || c.risk_level === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Alto Risco</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {clients.filter(c => c.latitude && c.longitude).length}
            </div>
            <p className="text-xs text-muted-foreground">Com GPS</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {clients.filter(c => c.alarm_chip).length}
            </div>
            <p className="text-xs text-muted-foreground">Com Alarme</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro cliente.'}
                </p>
                {!searchTerm && (
                  <Button className="mt-4" onClick={() => navigate('/clients/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Cliente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  {getRiskLevelBadge(client.risk_level)}
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  {client.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {client.zins_account && (
                    <div className="flex items-center text-sm">
                      <Shield className="mr-2 h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">ZINS:</span>
                      <span className="ml-1 font-mono">{client.zins_account}</span>
                    </div>
                  )}
                  
                  {client.alarm_chip && (
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Chip:</span>
                      <span className="ml-1 font-mono">{client.alarm_chip}</span>
                    </div>
                  )}

                  {client.latitude && client.longitude && (
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground">GPS configurado</span>
                    </div>
                  )}

                  {client.monitored_areas && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Áreas:</span>
                      <span className="ml-1">{client.monitored_areas}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Clients;