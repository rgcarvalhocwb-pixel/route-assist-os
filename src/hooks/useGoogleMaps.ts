import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGoogleMaps = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-maps-config');
        
        if (error) throw error;
        
        setApiKey(data.apiKey);
        setConfigured(data.configured);
      } catch (error) {
        console.error('Erro ao buscar configuração do Google Maps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return {
    apiKey,
    loading,
    configured
  };
};