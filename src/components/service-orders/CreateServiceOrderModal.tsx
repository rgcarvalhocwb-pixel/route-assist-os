
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useClients } from '@/hooks/useClients';

interface CreateServiceOrderModalProps {
  onOrderCreated: () => void;
}

export const CreateServiceOrderModal = ({ onOrderCreated }: CreateServiceOrderModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    service_type: 'maintenance' as 'installation' | 'maintenance' | 'preventive_maintenance' | 'repair' | 'technical_support',
    description: '',
    scheduled_date: ''
  });
  const { clients } = useClients();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.service_type) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Cliente e tipo de serviço são obrigatórios",
      });
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        client_id: formData.client_id,
        service_type: formData.service_type,
        description: formData.description || null,
        scheduled_date: formData.scheduled_date || null,
        status: 'open' as 'open' | 'in_progress' | 'completed' | 'cancelled'
      };

      const { error } = await supabase
        .from('service_orders')
        .insert(orderData);

      if (error) throw error;

      toast({
        title: "Ordem criada",
        description: "Ordem de serviço foi criada com sucesso!",
      });

      setFormData({
        client_id: '',
        service_type: 'maintenance',
        description: '',
        scheduled_date: ''
      });
      setOpen(false);
      onOrderCreated();
    } catch (error: any) {
      console.error('Erro ao criar ordem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar ordem",
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
          Nova Ordem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Preencha as informações da ordem de serviço abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente *</Label>
            <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_type">Tipo de Serviço *</Label>
            <Select value={formData.service_type} onValueChange={(value: 'installation' | 'maintenance' | 'preventive_maintenance' | 'repair' | 'technical_support') => setFormData({ ...formData, service_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="installation">Instalação</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="preventive_maintenance">Manutenção Preventiva</SelectItem>
                <SelectItem value="repair">Reparo</SelectItem>
                <SelectItem value="technical_support">Suporte Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o serviço a ser executado..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Data Agendada</Label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Ordem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
