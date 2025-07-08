import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AppointmentData {
  user_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  exclude_appointment_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { appointment_data }: { appointment_data: AppointmentData } = await req.json();

    console.log('Validating appointment:', appointment_data);

    // Check availability using the database function
    const { data: isAvailable, error: availabilityError } = await supabase
      .rpc('check_appointment_availability', {
        p_user_id: appointment_data.user_id,
        p_appointment_date: appointment_data.appointment_date,
        p_appointment_time: appointment_data.appointment_time,
        p_duration: appointment_data.duration,
        p_exclude_appointment_id: appointment_data.exclude_appointment_id || null
      });

    if (availabilityError) {
      console.error('Error checking availability:', availabilityError);
      throw new Error('Erro ao verificar disponibilidade');
    }

    if (!isAvailable) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Horário não disponível. Verifique conflitos ou horário de trabalho.',
          conflicts: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Get conflicting appointments for detailed response
    const { data: conflicts, error: conflictsError } = await supabase
      .from('appointments')
      .select('id, client_name, service_name, appointment_time, duration')
      .eq('user_id', appointment_data.user_id)
      .eq('appointment_date', appointment_data.appointment_date)
      .neq('status', 'cancelado')
      .not('id', 'eq', appointment_data.exclude_appointment_id || 'none');

    if (conflictsError) {
      console.error('Error getting conflicts:', conflictsError);
    }

    // Additional validation: Check if user has working hours for this day
    const appointmentDate = new Date(appointment_data.appointment_date);
    const dayOfWeek = appointmentDate.getDay();

    const { data: workingHours, error: workingHoursError } = await supabase
      .from('working_hours')
      .select('start_time, end_time')
      .eq('user_id', appointment_data.user_id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single();

    if (workingHoursError || !workingHours) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Não há horário de trabalho definido para este dia da semana.',
          conflicts: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Check if appointment is within working hours
    const appointmentStartTime = appointment_data.appointment_time;
    const appointmentEndTime = new Date(
      new Date(`2000-01-01T${appointment_data.appointment_time}`)
        .getTime() + (appointment_data.duration * 60000)
    ).toTimeString().slice(0, 5);

    if (appointmentStartTime < workingHours.start_time || 
        appointmentEndTime > workingHours.end_time) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: `Agendamento fora do horário de trabalho (${workingHours.start_time} - ${workingHours.end_time}).`,
          conflicts: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('Appointment validation successful');

    return new Response(
      JSON.stringify({
        valid: true,
        message: 'Horário disponível',
        working_hours: workingHours,
        conflicts: conflicts || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in validate-appointment function:', error);
    
    return new Response(
      JSON.stringify({
        valid: false,
        error: error.message || 'Erro interno do servidor',
        conflicts: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});