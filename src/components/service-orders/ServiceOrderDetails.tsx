
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, User, Phone, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServiceOrderDetailsProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: () => void;
}

export const ServiceOrderDetails = ({ order, open, onOpenChange, onOrderUpdated }: ServiceOrderDetailsProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    status: order?.status || 'open',
    notes: order?.notes || '',
    client_signature: order?.client_signature || ''
  });
  const { toast } = useToast();

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

  const handleStatusChange = async () => {
    if (!order?.id) return;

    setLoading(true);
    
    try {
      const photoUrls = await uploadFiles();
      const existingPhotos = order.photos || [];
      const allPhotos = [...existingPhotos, ...photoUrls];

      const updateData: any = {
        status: formData.status,
        notes: formData.notes,
        photos: allPhotos.length > 0 ? allPhotos : null,
        client_signature: formData.client_signature || null
      };

      if (formData.status === 'in_progress' && order.status === 'open') {
        updateData.started_at = new Date().toISOString();
      }

      if (formData.status === 'completed' && order.status !== 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Ordem atualizada",
        description: "A ordem de serviço foi atualizada com sucesso!",
      });

      setSelectedFiles([]);
      onOrderUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar ordem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar ordem",
        description: error.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: 'Aberta', variant: 'default' as const },
      in_progress: { label: 'Em Andamento', variant: 'secondary' as const },
      completed: { label: 'Concluída', variant: 'outline' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ordem de Serviço - {order.clients?.name}
            {getStatusBadge(order.status)}
          </DialogTitle>
          <DialogDescription>
            Gerencie os detalhes da ordem de serviço
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Nome:</strong> {order.clients?.name}
              </div>
              <div>
                <strong>Endereço:</strong> {order.clients?.address}
              </div>
            </div>
          </div>

          {/* Detalhes do Serviço */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Detalhes do Serviço
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Tipo:</strong> {order.service_type}
              </div>
              <div>
                <strong>Criada em:</strong> {new Date(order.created_at).toLocaleDateString('pt-BR')}
              </div>
              {order.scheduled_date && (
                <div>
                  <strong>Agendada para:</strong> {new Date(order.scheduled_date).toLocaleString('pt-BR')}
                </div>
              )}
              {order.started_at && (
                <div>
                  <strong>Iniciada em:</strong> {new Date(order.started_at).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
            {order.description && (
              <div className="mt-3">
                <strong>Descrição:</strong>
                <p className="mt-1 text-muted-foreground">{order.description}</p>
              </div>
            )}
          </div>

          {/* Fotos Existentes */}
          {order.photos && order.photos.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Fotos Anexadas</h3>
              <div className="grid grid-cols-3 gap-2">
                {order.photos.map((photo: string, index: number) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-20 object-cover rounded cursor-pointer"
                    onClick={() => window.open(photo, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status e Atualizações */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberta</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações do Técnico</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Adicione observações sobre o atendimento..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_signature">Assinatura do Cliente</Label>
              <Input
                id="client_signature"
                value={formData.client_signature}
                onChange={(e) => setFormData({ ...formData, client_signature: e.target.value })}
                placeholder="Nome do responsável que assinou"
              />
            </div>

            <div className="space-y-2">
              <Label>Adicionar Fotos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Adicionar fotos do atendimento
                  </span>
                </label>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Fotos para adicionar:</div>
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
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusChange} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
