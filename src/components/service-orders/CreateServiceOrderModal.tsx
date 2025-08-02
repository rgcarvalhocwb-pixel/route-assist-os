
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useClients } from '@/hooks/useClients';

interface CreateServiceOrderModalProps {
  onOrderCreated: () => void;
}

interface Technician {
  id: string;
  name: string;
}

export const CreateServiceOrderModal = ({ onOrderCreated }: CreateServiceOrderModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    technician_id: '',
    service_type: 'preventive_maintenance' as 'installation' | 'preventive_maintenance' | 'corrective_maintenance' | 'inspection',
    description: '',
    scheduled_date: '',
    requestor_name: '',
    account_number: '',
    notes: ''
  });
  const { clients } = useClients();
  const { toast } = useToast();

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name')
        .eq('role', 'technician');

      if (error) throw error;
      
      setTechnicians(data?.map(profile => ({
        id: profile.user_id,
        name: profile.name
      })) || []);
    } catch (error) {
      console.error('Erro ao buscar técnicos:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles([...selectedFiles, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `service-orders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

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
      const photoUrls = await uploadFiles();

      const orderData = {
        client_id: formData.client_id,
        technician_id: formData.technician_id || null,
        service_type: formData.service_type,
        description: formData.description || null,
        scheduled_date: formData.scheduled_date || null,
        notes: formData.notes || null,
        photos: photoUrls.length > 0 ? photoUrls : null,
        status: 'open' as 'open' | 'in_progress' | 'completed' | 'cancelled'
      };

      const { error } = await supabase
        .from('service_orders')
        .insert([orderData]);

      if (error) throw error;

      toast({
        title: "Ordem criada",
        description: "Ordem de serviço foi criada com sucesso!",
      });

      setFormData({
        client_id: '',
        technician_id: '',
        service_type: 'preventive_maintenance',
        description: '',
        scheduled_date: '',
        requestor_name: '',
        account_number: '',
        notes: ''
      });
      setSelectedFiles([]);
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

  const selectedClient = clients.find(c => c.id === formData.client_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Nova Ordem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Preencha as informações da ordem de serviço abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="technician_id">Técnico Responsável</Label>
              <Select value={formData.technician_id} onValueChange={(value) => setFormData({ ...formData, technician_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id}>
                      {technician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedClient && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Informações do Cliente:</div>
              <div className="text-sm">
                <strong>Nome:</strong> {selectedClient.name}<br/>
                <strong>Endereço:</strong> {selectedClient.address}<br/>
                {selectedClient.zins_account && <><strong>Conta ZINS:</strong> {selectedClient.zins_account}</>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestor_name">Solicitante</Label>
              <Input
                id="requestor_name"
                value={formData.requestor_name}
                onChange={(e) => setFormData({ ...formData, requestor_name: e.target.value })}
                placeholder="Nome do solicitante"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Número da Conta</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Número da conta"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_type">Tipo de Serviço *</Label>
            <Select value={formData.service_type} onValueChange={(value: 'installation' | 'preventive_maintenance' | 'corrective_maintenance' | 'inspection') => setFormData({ ...formData, service_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="installation">Instalação</SelectItem>
                <SelectItem value="preventive_maintenance">Manutenção Preventiva</SelectItem>
                <SelectItem value="corrective_maintenance">Manutenção Corretiva</SelectItem>
                <SelectItem value="inspection">Inspeção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Problema</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o problema ou serviço solicitado..."
              rows={3}
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

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Anexos (Fotos/Orçamentos)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Clique para anexar fotos ou documentos
                </span>
              </label>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Arquivos selecionados:</div>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm flex-1">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
