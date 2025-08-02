import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Clock, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';

interface Incident {
  id: string;
  client_id: string;
  type: string;
  status: string;
  description: string;
  severity: string;
  created_at: string;
  resolved_at?: string;
  clients?: {
    name: string;
    address: string;
  };
}

const Incidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          clients (
            name,
            address
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar ocorrências:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar ocorrências",
        description: error.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: 'Aberta', variant: 'destructive' as const },
      investigating: { label: 'Investigando', variant: 'secondary' as const },
      resolved: { label: 'Resolvida', variant: 'outline' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const severityMap = {
      low: { label: 'Baixa', color: 'bg-green-100 text-green-800' },
      medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Alta', color: 'bg-red-100 text-red-800' },
      critical: { label: 'Crítica', color: 'bg-red-200 text-red-900' }
    };
    
    const config = severityMap[severity as keyof typeof severityMap] || { label: severity, color: 'bg-gray-100 text-gray-800' };
    return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const getTypeLabel = (type: string) => {
    const typeMap = {
      security_breach: 'Violação de Segurança',
      technical_support: 'Suporte Técnico',
      equipment_failure: 'Falha de Equipamento',
      false_alarm: 'Alarme Falso',
      emergency: 'Emergência'
    };
    
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && incident.status === activeTab;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando ocorrências...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ocorrências</h1>
            <p className="text-muted-foreground mt-2">
              Monitore e gerencie todas as ocorrências de segurança
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Ocorrência
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidents.filter(i => i.status === 'open').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investigando</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidents.filter(i => i.status === 'investigating').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidents.filter(i => i.status === 'resolved').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative flex-1 mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar ocorrências..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Incidents Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="open">Abertas</TabsTrigger>
            <TabsTrigger value="investigating">Investigando</TabsTrigger>
            <TabsTrigger value="resolved">Resolvidas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-4">
              {filteredIncidents.map((incident) => (
                <Card key={incident.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {incident.clients?.name || 'Cliente não encontrado'}
                          {getStatusBadge(incident.status)}
                        </CardTitle>
                        <CardDescription>
                          {incident.clients?.address}
                        </CardDescription>
                      </div>
                      <div className="text-right space-y-1">
                        {getSeverityBadge(incident.severity)}
                        <div className="text-xs text-muted-foreground">
                          {getTypeLabel(incident.type)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>
                        Criada em: {new Date(incident.created_at).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {incident.resolved_at && (
                        <span>
                          Resolvida em: {new Date(incident.resolved_at).toLocaleDateString('pt-BR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredIncidents.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma ocorrência encontrada</h3>
                    <p className="text-muted-foreground text-center">
                      {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Nenhuma ocorrência registrada.'}
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

export default Incidents;
