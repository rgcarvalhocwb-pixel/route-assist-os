
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CsvImporterProps {
  title: string;
  description: string;
  sampleData: Record<string, any>[];
  onImport: (data: Record<string, any>[]) => Promise<void>;
  requiredFields: string[];
  filename: string;
}

export default function CsvImporter({ 
  title, 
  description, 
  sampleData, 
  onImport, 
  requiredFields,
  filename 
}: CsvImporterProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadSampleCsv = () => {
    if (sampleData.length === 0) return;

    const headers = Object.keys(sampleData[0]);
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `modelo_${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo CSV.",
      });
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('O arquivo deve conter pelo menos um cabeçalho e uma linha de dados');
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      // Verificar campos obrigatórios
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
      }

      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const row: Record<string, any> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      await onImport(data);
      
      toast({
        title: "Importação concluída!",
        description: `${data.length} registros foram importados com sucesso.`,
      });
      
      setShowModal(false);
    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro ao importar o arquivo",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Modelo do arquivo
              </CardTitle>
              <CardDescription className="text-xs">
                Baixe o modelo CSV para ver o formato correto dos dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadSampleCsv}
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar Modelo
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Selecionar arquivo CSV</Label>
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isImporting}
            />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Campos obrigatórios:</strong> {requiredFields.join(', ')}</p>
            <p>• O arquivo deve estar no formato CSV (separado por vírgulas)</p>
            <p>• A primeira linha deve conter os cabeçalhos</p>
            <p>• Use aspas duplas para campos com vírgulas</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
