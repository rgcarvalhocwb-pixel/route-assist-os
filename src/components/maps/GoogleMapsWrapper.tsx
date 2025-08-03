import React, { ReactNode } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Loader2 } from 'lucide-react';

interface GoogleMapsWrapperProps {
  children: ReactNode;
  apiKey?: string;
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Carregando mapa...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium">Erro ao carregar Google Maps</p>
            <p className="text-xs text-muted-foreground">
              Verifique se a API key está configurada corretamente
            </p>
          </div>
        </div>
      );
    case Status.SUCCESS:
      return null;
  }
};

const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({ 
  children, 
  apiKey 
}) => {
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium">Google Maps não configurado</p>
          <p className="text-xs text-muted-foreground">
            Configure a API key do Google Maps para visualizar os mapas
          </p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper 
      apiKey={apiKey} 
      render={render}
      libraries={['places']}
    >
      {children}
    </Wrapper>
  );
};

export default GoogleMapsWrapper;