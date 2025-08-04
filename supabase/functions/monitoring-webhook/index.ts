import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { 
      device_imei, 
      event_type, 
      event_data = {},
      latitude,
      longitude,
      battery_level,
      signal_strength,
      timestamp 
    } = await req.json();

    console.log('Received monitoring data:', {
      device_imei,
      event_type,
      event_data,
      latitude,
      longitude,
      battery_level,
      signal_strength,
      timestamp
    });

    // Encontrar dispositivo pelo IMEI
    const { data: device, error: deviceError } = await supabaseService
      .from('monitoring_devices')
      .select('id, client_id, device_name')
      .eq('imei', device_imei)
      .single();

    if (deviceError || !device) {
      console.error('Device not found:', device_imei, deviceError);
      return new Response(
        JSON.stringify({ 
          error: 'Dispositivo não encontrado',
          device_imei 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Inserir evento de monitoramento
    const { data: eventData, error: eventError } = await supabaseService
      .from('monitoring_events')
      .insert({
        device_id: device.id,
        event_type,
        event_data,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        battery_level: battery_level ? parseInt(battery_level) : null,
        signal_strength: signal_strength ? parseInt(signal_strength) : null,
        timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
        processed: false,
        alert_sent: false
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error inserting event:', eventError);
      return new Response(
        JSON.stringify({ error: 'Erro ao registrar evento' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log('Event registered successfully:', eventData);

    // Verificar se é um evento crítico que precisa de alerta
    const criticalEvents = ['alarm', 'zone_violation', 'tamper_alert', 'power_failure'];
    if (criticalEvents.includes(event_type)) {
      console.log('Critical event detected, processing alerts...');
      
      // Buscar alertas configurados para este dispositivo
      const { data: alerts } = await supabaseService
        .from('monitoring_alerts')
        .select('*')
        .eq('device_id', device.id)
        .eq('is_active', true);

      // Aqui você pode implementar o envio de notificações
      // (email, SMS, webhooks, etc.)
      if (alerts && alerts.length > 0) {
        console.log(`Found ${alerts.length} alerts to process for device ${device.device_name}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        event_id: eventData.id,
        device_name: device.device_name,
        message: 'Evento registrado com sucesso'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('Error processing monitoring data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});