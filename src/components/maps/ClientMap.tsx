import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface ClientMapProps {
  clients: Array<{
    id: string;
    name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    risk_level: string;
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

const ClientMap: React.FC<ClientMapProps> = ({ 
  clients, 
  center = { lat: -25.4284, lng: -49.2733 }, // Curitiba default
  zoom = 12,
  height = "400px"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    // Add markers for clients with coordinates
    const clientsWithCoords = clients.filter(client => 
      client.latitude !== null && 
      client.longitude !== null &&
      typeof client.latitude === 'number' &&
      typeof client.longitude === 'number'
    );

    clientsWithCoords.forEach(client => {
      if (!googleMapRef.current) return;

      const marker = new window.google.maps.Marker({
        position: { 
          lat: client.latitude as number, 
          lng: client.longitude as number 
        },
        map: googleMapRef.current,
        title: client.name,
        icon: {
          url: getRiskIcon(client.risk_level),
          scaledSize: new window.google.maps.Size(30, 30),
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${client.name}</h3>
            <p style="margin: 0; color: #666;">${client.address}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px;">
              <span style="background-color: ${getRiskColor(client.risk_level)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">
                ${getRiskLabel(client.risk_level)}
              </span>
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current, marker);
      });
    });

  }, [clients, center, zoom]);

  const getRiskIcon = (riskLevel: string) => {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b', 
      high: '#ef4444',
      critical: '#dc2626'
    };
    const color = colors[riskLevel as keyof typeof colors] || colors.medium;
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="${color}">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`;
  };

  const getRiskColor = (riskLevel: string) => {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444', 
      critical: '#dc2626'
    };
    return colors[riskLevel as keyof typeof colors] || colors.medium;
  };

  const getRiskLabel = (riskLevel: string) => {
    const labels = {
      low: 'Baixo',
      medium: 'Médio', 
      high: 'Alto',
      critical: 'Crítico'
    };
    return labels[riskLevel as keyof typeof labels] || 'Médio';
  };

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height }}
      className="rounded-lg border"
    />
  );
};

export default ClientMap;