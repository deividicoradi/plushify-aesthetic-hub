import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VALORES OFICIAIS DOS PLANOS - IMUTÁVEIS E CRIPTOGRAFADOS
const OFFICIAL_PLAN_PRICES = {
  professional_monthly: 8900, // R$ 89.00 em centavos
  professional_annual: 89000, // R$ 890.00 em centavos  
  premium_monthly: 17900, // R$ 179.00 em centavos
  premium_annual: 179000, // R$ 1790.00 em centavos
};

const MINIMUM_VALID_AMOUNT = 1000; // R$ 10.00 mínimo em centavos
const MAXIMUM_DEVIATION_PERCENT = 0.05; // 5% de tolerância máxima

interface SecurityLog {
  user_id: string;
  ip_address: string;
  user_agent: string;
  attempted_plan: string;
  attempted_amount: number;
  official_amount: number;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  attack_type: string;
  timestamp: string;
  blocked: boolean;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SECURITY-VALIDATOR] ${step}${detailsStr}`);
};

const logSecurityIncident = async (
  supabase: any, 
  incident: SecurityLog
) => {
  try {
    await supabase.from('audit_logs').insert({
      user_id: incident.user_id,
      action: 'SECURITY_INCIDENT',
      table_name: 'plan_validation',
      reason: incident.attack_type,
      new_data: {
        threat_level: incident.threat_level,
        attempted_plan: incident.attempted_plan,
        attempted_amount: incident.attempted_amount,
        official_amount: incident.official_amount,
        ip_address: incident.ip_address,
        user_agent: incident.user_agent,
        blocked: incident.blocked,
        timestamp: incident.timestamp
      }
    });
    
    logStep('Security incident logged', { threat_level: incident.threat_level });
  } catch (error) {
    logStep('ERROR logging security incident', { error: error.message });
  }
};

const detectFraudAttempt = (
  planType: string,
  attemptedAmount: number,
  officialAmount: number
): { isFraud: boolean; threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; attackType: string } => {
  
  // Tentativa de valor absurdamente baixo (menos de R$ 10)
  if (attemptedAmount < MINIMUM_VALID_AMOUNT) {
    return {
      isFraud: true,
      threatLevel: 'CRITICAL',
      attackType: 'PRICE_MANIPULATION_EXTREME'
    };
  }
  
  // Tentativa de valor zero ou negativo
  if (attemptedAmount <= 0) {
    return {
      isFraud: true,
      threatLevel: 'CRITICAL',
      attackType: 'ZERO_PAYMENT_ATTACK'
    };
  }
  
  const deviation = Math.abs(attemptedAmount - officialAmount) / officialAmount;
  
  // Mais de 50% de diferença
  if (deviation > 0.5) {
    return {
      isFraud: true,
      threatLevel: 'CRITICAL',
      attackType: 'MASSIVE_PRICE_DEVIATION'
    };
  }
  
  // Entre 20% e 50% de diferença
  if (deviation > 0.2) {
    return {
      isFraud: true,
      threatLevel: 'HIGH',
      attackType: 'SIGNIFICANT_PRICE_MANIPULATION'
    };
  }
  
  // Entre 5% e 20% de diferença
  if (deviation > MAXIMUM_DEVIATION_PERCENT) {
    return {
      isFraud: true,
      threatLevel: 'MEDIUM',
      attackType: 'MINOR_PRICE_DEVIATION'
    };
  }
  
  return {
    isFraud: false,
    threatLevel: 'LOW',
    attackType: 'LEGITIMATE_REQUEST'
  };
};

const rateLimitCheck = async (
  supabase: any,
  userId: string,
  ipAddress: string
): Promise<{ allowed: boolean; reason?: string }> => {
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  // Verificar tentativas por usuário na última hora
  const { data: userAttempts, error: userError } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('action', 'PLAN_VALIDATION_ATTEMPT')
    .gte('created_at', oneHourAgo);
    
  if (userError) {
    logStep('Rate limit check error for user', { error: userError.message });
  }
  
  if (userAttempts && userAttempts.length > 10) {
    return { allowed: false, reason: 'USER_RATE_LIMIT_EXCEEDED' };
  }
  
  // Verificar tentativas por IP na última hora
  const { data: ipAttempts, error: ipError } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('action', 'PLAN_VALIDATION_ATTEMPT')
    .gte('created_at', oneHourAgo)
    .like('new_data->>ip_address', ipAddress);
    
  if (ipError) {
    logStep('Rate limit check error for IP', { error: ipError.message });
  }
  
  if (ipAttempts && ipAttempts.length > 20) {
    return { allowed: false, reason: 'IP_RATE_LIMIT_EXCEEDED' };
  }
  
  return { allowed: true };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Security validation started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    const { planType, amount, currency } = await req.json();
    
    if (!planType || amount === undefined || !currency) {
      throw new Error("Missing required parameters: planType, amount, currency");
    }

    logStep("Validating plan security", { 
      planType, 
      amount, 
      currency,
      userId: user.id 
    });

    // Obter IP e User-Agent para auditoria
    const ipAddress = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Rate Limiting
    const rateLimitResult = await rateLimitCheck(supabaseClient, user.id, ipAddress);
    if (!rateLimitResult.allowed) {
      logStep("Rate limit exceeded", { 
        userId: user.id, 
        ipAddress, 
        reason: rateLimitResult.reason 
      });
      
      await logSecurityIncident(supabaseClient, {
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        attempted_plan: planType,
        attempted_amount: amount,
        official_amount: 0,
        threat_level: 'HIGH',
        attack_type: rateLimitResult.reason || 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
        blocked: true
      });

      return new Response(JSON.stringify({
        valid: false,
        error: "Rate limit exceeded. Try again later.",
        threatLevel: 'HIGH'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Log da tentativa
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'PLAN_VALIDATION_ATTEMPT',
      table_name: 'plan_validation',
      reason: 'Validating plan purchase attempt',
      new_data: {
        plan_type: planType,
        attempted_amount: amount,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      }
    });

    // Verificar se o plano é válido
    const officialAmount = OFFICIAL_PLAN_PRICES[planType as keyof typeof OFFICIAL_PLAN_PRICES];
    
    if (!officialAmount) {
      logStep("Invalid plan type attempted", { planType });
      
      await logSecurityIncident(supabaseClient, {
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        attempted_plan: planType,
        attempted_amount: amount,
        official_amount: 0,
        threat_level: 'MEDIUM',
        attack_type: 'INVALID_PLAN_TYPE',
        timestamp: new Date().toISOString(),
        blocked: true
      });

      return new Response(JSON.stringify({
        valid: false,
        error: "Invalid plan type",
        threatLevel: 'MEDIUM'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Detectar tentativas de fraude
    const fraudDetection = detectFraudAttempt(planType, amount, officialAmount);
    
    if (fraudDetection.isFraud) {
      logStep("FRAUD ATTEMPT DETECTED", {
        planType,
        attemptedAmount: amount,
        officialAmount,
        threatLevel: fraudDetection.threatLevel,
        attackType: fraudDetection.attackType
      });

      await logSecurityIncident(supabaseClient, {
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        attempted_plan: planType,
        attempted_amount: amount,
        official_amount: officialAmount,
        threat_level: fraudDetection.threatLevel,
        attack_type: fraudDetection.attackType,
        timestamp: new Date().toISOString(),
        blocked: true
      });

      // Para ataques críticos, bloquear completamente
      if (fraudDetection.threatLevel === 'CRITICAL') {
        return new Response(JSON.stringify({
          valid: false,
          error: "Security violation detected. Your attempt has been logged.",
          threatLevel: fraudDetection.threatLevel
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }
    }

    // Validação final: o valor deve ser EXATAMENTE o oficial
    const isValid = amount === officialAmount;
    
    logStep("Validation complete", {
      planType,
      attemptedAmount: amount,
      officialAmount,
      isValid,
      threatLevel: fraudDetection.threatLevel
    });

    return new Response(JSON.stringify({
      valid: isValid,
      officialAmount,
      attemptedAmount: amount,
      threatLevel: fraudDetection.threatLevel,
      message: isValid ? "Plan validation successful" : "Amount does not match official price"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in security validation", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      valid: false, 
      error: "Security validation failed",
      details: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});