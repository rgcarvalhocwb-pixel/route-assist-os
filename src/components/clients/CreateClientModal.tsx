
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateClientModalProps {
  onClientCreated: () => void;
}

export const CreateClientModal = ({ onClientCreated }: CreateClientModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    risk_level: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    alarm_chip: '',
    zins_account: '',
    client_routine: '',
    monitored_areas: '',
    latitude: '',
    longitude: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Nome e endereço são obrigatórios",
      });
      return;
    }

    setLoading(true);
    
    try {
      const clientData = {
        name: formData.name,
        address: formData.address,
        risk_level: formData.risk_level,
        alarm_chip: formData.alarm_chip || null,
        zins_account: formData.zins_account || null,
        client_routine: formData.client_routine || null,
        monitored_areas: formData.monitored_areas || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      const { error } = await supabase
        .from('clients')
        .insert([clientData]);

      if (error) throw error;

      toast({
        title: "Cliente criado",
        description: "Cliente foi criado com sucesso!",
      });

      setFormData({
        name: '',
        address: '',
        risk_level: 'medium',
        alarm_chip: '',
        zins_account: '',
        client_routine: '',
        monitored_areas: '',
        latitude: '',
        longitude: ''
      });
      setOpen(false);
      onClientCreated();
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar cliente",
        description: error.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha as informações do cliente abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_level">Nível de Risco</Label>
            <Select value={formData.risk_level} onValueChange={(value: any) => setFormData({ ...formData, risk_level: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alarm_chip">Chip Alarme</Label>
              <Input
                id="alarm_chip"
                value={formData.alarm_chip}
                onChange={(e) => setFormData({ ...formData, alarm_chip: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zins_account">Conta ZINS</Label>
              <Input
                id="zins_account"
                value={formData.zins_account}
                onChange={(e) => setFormData({ ...formData, zins_account: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_routine">Rotina do Cliente</Label>
            <Textarea
              id="client_routine"
              value={formData.client_routine}
              onChange={(e) => setFormData({ ...formData, client_routine: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monitored_areas">Áreas Monitoradas</Label>
            <Textarea
              id="monitored_areas"
              value={formData.monitored_areas}
              onChange={(e) => setFormData({ ...formData, monitored_areas: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
