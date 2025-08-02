
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Route, FileText, AlertTriangle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao RouteAssist OS - Sistema de Gestão Operacional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/clients')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Ativos no sistema</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/routes')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rotas</CardTitle>
              <Route className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Otimizadas hoje</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/service-orders')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
              <FileText className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/incidents')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocorrências</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Em aberto</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nova rota criada</p>
                    <p className="text-xs text-muted-foreground">Rota Centro - 5 paradas</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2min atrás</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cliente atualizado</p>
                    <p className="text-xs text-muted-foreground">Empresa ABC Ltda</p>
                  </div>
                  <span className="text-xs text-muted-foreground">15min atrás</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">OS concluída</p>
                    <p className="text-xs text-muted-foreground">Manutenção preventiva</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1h atrás</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>Indicadores operacionais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rotas Ativas</span>
                  <span className="text-sm font-medium text-green-600">8 de 12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Técnicos em Campo</span>
                  <span className="text-sm font-medium text-blue-600">5 de 6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Equipamentos Online</span>
                  <span className="text-sm font-medium text-green-600">98%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ocorrências Abertas</span>
                  <span className="text-sm font-medium text-yellow-600">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
