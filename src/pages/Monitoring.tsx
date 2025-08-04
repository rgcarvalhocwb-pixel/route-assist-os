import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Smartphone, 
  Wifi, 
  Battery, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  Search,
  Plus,
  Activity
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useMonitoringDevices, useMonitoringEvents } from '@/hooks/useMonitoring';
import GoogleMapsWrapper from '@/components/maps/GoogleMapsWrapper';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Monitoring = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMap, setShowMap] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  
  const { devices, loading: devicesLoading } = useMonitoringDevices();
  const { events, loading: eventsLoading } = useMonitoringEvents(selectedDevice || undefined, 100);
  const { apiKey } = useGoogleMaps();

  const getStatusBadge = (status: string) => {
    const statusMap = {
      online: { label: 'Online', variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
      offline: { label: 'Offline', variant: 'secondary' as const, icon: Clock, color: 'text-gray-500' },
      alarm: { label: 'Alarme', variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-500' },
      maintenance: { label: 'Manutenção', variant: 'outline' as const, icon: Shield, color: 'text-orange-500' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.offline;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const getOperatorBadge = (operator: string) => {
    const operatorColors = {
      tim: 'bg-blue-100 text-blue-800',
      claro: 'bg-red-100 text-red-800', 
      vivo: 'bg-purple-100 text-purple-800',
      algar: 'bg-green-100 text-green-800'
    };
    
    const colorClass = operatorColors[operator as keyof typeof operatorColors] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {operator?.toUpperCase()}
      </span>
    );
  };

  const getEventTypeBadge = (eventType: string) => {
    const eventMap = {
      heartbeat: { label: 'Heartbeat', variant: 'secondary' as const },
      alarm: { label: 'Alarme', variant: 'destructive' as const },
      disarm: { label: 'Desarmado', variant: 'default' as const },
      arm: { label: 'Armado', variant: 'default' as const },
      zone_violation: { label: 'Violação de Zona', variant: 'destructive' as const },
      battery_low: { label: 'Bateria Baixa', variant: 'outline' as const },
      power_failure: { label: 'Falha de Energia', variant: 'destructive' as const },
      signal_loss: { label: 'Perda de Sinal', variant: 'outline' as const },
      maintenance: { label: 'Manutenção', variant: 'secondary' as const },
      gps_position: { label: 'Posição GPS', variant: 'default' as const },
      device_reset: { label: 'Reset do Dispositivo', variant: 'outline' as const },
      tamper_alert: { label: 'Violação Física', variant: 'destructive' as const }
    };
    
    const config = eventMap[eventType as keyof typeof eventMap] || { label: eventType, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.imei?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && device.device_status === statusFilter;
  });

  const devicesWithLocation = devices.filter(device => 
    events.some(event => 
      event.device_id === device.id && 
      event.latitude && 
      event.longitude
    )
  );

  if (devicesLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando dispositivos...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Monitoramento de Centrais</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe o status das centrais Intelbras e eventos em tempo real
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              {showMap ? 'Lista' : 'Mapa'}
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Dispositivo
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dispositivos</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{devices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {devices.filter(d => d.device_status === 'online').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Alarme</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {devices.filter(d => d.device_status === 'alarm').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Hoje</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.filter(e => 
                  new Date(e.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map View */}
        {showMap && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Mapa de Dispositivos</CardTitle>
              <CardDescription>
                Últimas posições conhecidas dos dispositivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleMapsWrapper apiKey={apiKey}>
                <div className="h-96 w-full bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Mapa dos dispositivos com GPS será implementado aqui
                  </p>
                </div>
              </GoogleMapsWrapper>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar dispositivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="alarm">Em Alarme</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            <TabsTrigger value="events">Eventos Recentes</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="mt-6">
            <div className="grid gap-6">
              {filteredDevices.map((device) => (
                <Card key={device.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {device.device_name}
                          {getStatusBadge(device.device_status)}
                        </CardTitle>
                        <CardDescription>
                          {device.client?.name} - {device.client?.address}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        {device.operator && getOperatorBadge(device.operator)}
                        {device.chip_number && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Smartphone className="h-3 w-3" />
                            {device.chip_number}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {device.battery_level ? `${device.battery_level}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {device.signal_strength ? `${device.signal_strength}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {device.last_communication 
                            ? formatDistanceToNow(new Date(device.last_communication), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })
                            : 'Nunca'
                          }
                        </span>
                      </div>
                      {device.imei && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">IMEI:</span>
                          <span className="font-mono text-xs">{device.imei}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="space-y-4">
              {eventsLoading ? (
                <div className="text-center py-8">Carregando eventos...</div>
              ) : events.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
                    <p className="text-muted-foreground text-center">
                      Os eventos aparecerão aqui conforme forem recebidos das centrais.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getEventTypeBadge(event.event_type)}
                            <span className="text-sm text-muted-foreground">
                              {event.device?.device_name} - {event.device?.client?.name}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(event.timestamp), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          {event.battery_level && (
                            <div className="flex items-center gap-1">
                              <Battery className="h-3 w-3" />
                              {event.battery_level}%
                            </div>
                          )}
                          {event.signal_strength && (
                            <div className="flex items-center gap-1">
                              <Wifi className="h-3 w-3" />
                              {event.signal_strength}%
                            </div>
                          )}
                          {event.latitude && event.longitude && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              GPS
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Monitoring;