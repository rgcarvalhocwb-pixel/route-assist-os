import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MonitoringDevice {
  id: string;
  client_id: string;
  device_name: string;
  device_type: string;
  chip_number?: string | null;
  operator?: string | null;
  imei?: string | null;
  device_status: string;
  last_communication?: string | null;
  battery_level?: number | null;
  signal_strength?: number | null;
  firmware_version?: string | null;
  configuration?: any;
  created_at: string;
  updated_at: string;
  client?: {
    name: string;
    address: string;
  };
}

export interface MonitoringEvent {
  id: string;
  device_id: string;
  event_type: string;
  event_data?: any;
  latitude?: number | null;
  longitude?: number | null;
  battery_level?: number | null;
  signal_strength?: number | null;
  timestamp: string;
  processed: boolean;
  alert_sent: boolean;
  created_at: string;
  device?: {
    device_name: string;
    client?: {
      name: string;
    };
  };
}

export const useMonitoringDevices = () => {
  const [devices, setDevices] = useState<MonitoringDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('monitoring_devices')
        .select(`
          *,
          client:clients(name, address)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar dispositivos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dispositivos",
        description: error.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();

    // Realtime subscription para dispositivos
    const devicesChannel = supabase
      .channel('monitoring_devices_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'monitoring_devices'
        },
        () => {
          fetchDevices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(devicesChannel);
    };
  }, []);

  return {
    devices,
    loading,
    refetch: fetchDevices,
  };
};

export const useMonitoringEvents = (deviceId?: string, limit: number = 50) => {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('monitoring_events')
        .select(`
          *,
          device:monitoring_devices(
            device_name,
            client:clients(name)
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (deviceId) {
        query = query.eq('device_id', deviceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar eventos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar eventos",
        description: error.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Realtime subscription para eventos
    const eventsChannel = supabase
      .channel('monitoring_events_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'monitoring_events'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, [deviceId, limit]);

  return {
    events,
    loading,
    refetch: fetchEvents,
  };
};