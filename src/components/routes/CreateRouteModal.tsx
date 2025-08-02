
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, X, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';

interface RouteStop {
  id: string;
  address: string;
  client_name: string;
  notes?: string;
}

interface CreateRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRouteCreated: (route: any) => void;
}

const CreateRouteModal = ({ open, onOpenChange, onRouteCreated }: CreateRouteModalProps) => {
  const [routeName, setRouteName] = useState('');
  const [description, setDescription] = useState('');
  const [newStop, setNewStop] = useState({ address: '', client_name: '', notes: '' });
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { clients } = useClients();

  const addStop = () => {
    if (!newStop.address || !newStop.client_name) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Endereço e nome do cliente são obrigatórios.",
      });
      return;
    }

    const stop: RouteStop = {
      id: Date.now().toString(),
      address: newStop.address,
      client_name: newStop.client_name,
      notes: newStop.notes
    };

    setStops([...stops, stop]);
    setNewStop({ address: '', client_name: '', notes: '' });
  };

  const removeStop = (stopId: string) => {
    setStops(stops.filter(stop => stop.id !== stopId));
  };

  const handleCreateRoute = async () => {
    if (!routeName || stops.length === 0) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Nome da rota e pelo menos uma parada são obrigatórios.",
      });
      return;
    }

    setIsCreating(true);
    try {
      await onRouteCreated({
        name: routeName,
        description,
        stops: stops.map(stop => ({
          address: stop.address,
          client_name: stop.client_name,
          notes: stop.notes
        }))
      });

      // Reset form
      setRouteName('');
      setDescription('');
      setStops([]);
      setNewStop({ address: '', client_name: '', notes: '' });
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsCreating(false);
    }
  };

  const selectClient = (client: any) => {
    setNewStop({
      ...newStop,
      client_name: client.name,
      address: client.address
    });
  };

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Rota</DialogTitle>
          <DialogDescription>
            Crie uma nova rota adicionando paradas e otimize automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Route Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route-name">Nome da Rota*</Label>
              <Input
                id="route-name"
                placeholder="Ex: Rota Centro - Manhã"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Descrição opcional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Client Selection */}
          {clients.length > 0 && (
            <div className="space-y-2">
              <Label>Selecionar Cliente Existente</Label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {clients.map((client) => (
                  <Badge
                    key={client.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => selectClient(client)}
                  >
                    {client.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Stop */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adicionar Parada
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Nome do Cliente*</Label>
                <Input
                  id="client-name"
                  placeholder="Nome do cliente"
                  value={newStop.client_name}
                  onChange={(e) => setNewStop({ ...newStop, client_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço*</Label>
                <Input
                  id="address"
                  placeholder="Rua, número, bairro, cidade"
                  value={newStop.address}
                  onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações sobre a parada (opcional)"
                value={newStop.notes}
                onChange={(e) => setNewStop({ ...newStop, notes: e.target.value })}
                rows={2}
              />
            </div>
            
            <Button onClick={addStop} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Parada
            </Button>
          </div>

          {/* Stops List */}
          {stops.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Paradas da Rota ({stops.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{stop.client_name}</p>
                        <p className="text-xs text-muted-foreground">{stop.address}</p>
                        {stop.notes && (
                          <p className="text-xs text-muted-foreground italic">Obs: {stop.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInMaps(stop.address)}
                        className="h-8 w-8 p-0"
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStop(stop.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateRoute} 
            disabled={isCreating || !routeName || stops.length === 0}
          >
            {isCreating ? 'Criando...' : 'Criar Rota'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRouteModal;
