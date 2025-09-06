import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Functions: {
      auto_confirm_appointments: {
        Returns: number
      }
      auto_complete_appointments: {
        Returns: number
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log start of automation
    console.log('Starting appointment automation at:', new Date().toISOString())

    // Run auto-confirm function
    const { data: confirmData, error: confirmError } = await supabaseClient
      .rpc('auto_confirm_appointments')

    if (confirmError) {
      console.error('Error auto-confirming appointments:', confirmError)
      throw confirmError
    }

    console.log(`Auto-confirmed ${confirmData} appointments`)

    // Run auto-complete function
    const { data: completeData, error: completeError } = await supabaseClient
      .rpc('auto_complete_appointments')

    if (completeError) {
      console.error('Error auto-completing appointments:', completeError)
      throw completeError
    }

    console.log(`Auto-completed ${completeData} appointments`)

    // Log completion
    console.log('Appointment automation completed successfully at:', new Date().toISOString())

    return new Response(
      JSON.stringify({
        success: true,
        confirmed: confirmData,
        completed: completeData,
        message: `Processed ${confirmData} confirmations and ${completeData} completions`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Appointment automation error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})