import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GeolocationState {
  coords: GeolocationCoords | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: false,
    error: null,
  });
  const { toast } = useToast();

  const getCurrentPosition = (): Promise<GeolocationCoords> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada neste navegador'));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setState({ coords, loading: false, error: null });
          resolve(coords);
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo limite excedido para obter localização';
              break;
          }
          
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  const openNavigation = async (destinations: Array<{ address: string; name: string }>) => {
    try {
      const currentLocation = await getCurrentPosition();
      
      if (destinations.length === 0) {
        throw new Error('Nenhum destino fornecido');
      }

      // Para uma única parada, usar navegação simples
      if (destinations.length === 1) {
        const destination = destinations[0];
        const url = `https://www.google.com/maps/dir/${currentLocation.latitude},${currentLocation.longitude}/${encodeURIComponent(destination.address)}`;
        window.open(url, '_blank');
        return;
      }

      // Para múltiplas paradas, criar rota com waypoints
      const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
      const destination = encodeURIComponent(destinations[destinations.length - 1].address);
      const waypoints = destinations.slice(0, -1)
        .map(dest => encodeURIComponent(dest.address))
        .join('|');

      const url = `https://www.google.com/maps/dir/${origin}/${waypoints}/${destination}`;
      window.open(url, '_blank');

      toast({
        title: "Navegação iniciada",
        description: `Abrindo rota com ${destinations.length} paradas no Google Maps`,
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao iniciar navegação",
        description: error.message,
      });
    }
  };

  return {
    ...state,
    getCurrentPosition,
    openNavigation,
  };
};