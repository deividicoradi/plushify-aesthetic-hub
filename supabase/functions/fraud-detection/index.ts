import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FraudAnalysis {
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedPatterns: string[];
  recommendedAction: 'ALLOW' | 'REVIEW' | 'BLOCK';
  details: {
    userBehavior: any;
    paymentPattern: any;
    deviceFingerprint: any;
  };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FRAUD-DETECTION] ${step}${detailsStr}`);
};

const analyzeUserBehavior = async (
  supabase: any,
  userId: string
): Promise<{ score: number; patterns: string[] }> => {
  const patterns: string[] = [];
  let score = 0;

  // Verificar tentativas recentes de pagamento
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: recentAttempts } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .in('action', ['PLAN_VALIDATION_ATTEMPT', 'PAYMENT_ATTEMPT'])
    .gte('created_at', oneWeekAgo)
    .order('created_at', { ascending: false });

  if (recentAttempts) {
    // Muitas tentativas em pouco tempo
    if (recentAttempts.length > 20) {
      patterns.push('EXCESSIVE_PAYMENT_ATTEMPTS');
      score += 30;
    }

    // Verificar tentativas com valores diferentes
    const uniqueAmounts = new Set(
      recentAttempts
        .map((attempt: any) => attempt.new_data?.attempted_amount)
        .filter((amount: any) => amount !== undefined)
    );

    if (uniqueAmounts.size > 5) {
      patterns.push('MULTIPLE_AMOUNT_TESTING');
      score += 25;
    }

    // Verificar se há tentativas de valores muito baixos
    const lowValueAttempts = recentAttempts.filter(
      (attempt: any) => attempt.new_data?.attempted_amount && 
                 attempt.new_data.attempted_amount < 1000 // menos de R$ 10
    );

    if (lowValueAttempts.length > 0) {
      patterns.push('LOW_VALUE_MANIPULATION');
      score += 40;
    }
  }

  // Verificar conta nova com tentativas suspeitas
  const { data: userCreation } = await supabase.auth.admin.getUserById(userId);
  if (userCreation?.user) {
    const accountAge = Date.now() - new Date(userCreation.user.created_at).getTime();
    const hoursSinceCreation = accountAge / (1000 * 60 * 60);

    if (hoursSinceCreation < 24 && recentAttempts && recentAttempts.length > 3) {
      patterns.push('NEW_ACCOUNT_SUSPICIOUS_ACTIVITY');
      score += 35;
    }
  }

  return { score, patterns };
};

const analyzeDeviceFingerprint = (
  req: Request
): { score: number; patterns: string[] } => {
  const patterns: string[] = [];
  let score = 0;

  const userAgent = req.headers.get('user-agent') || '';
  const acceptLanguage = req.headers.get('accept-language') || '';
  const acceptEncoding = req.headers.get('accept-encoding') || '';

  // Verificar User-Agent suspeito
  if (!userAgent || userAgent.length < 10) {
    patterns.push('MISSING_OR_INVALID_USER_AGENT');
    score += 20;
  }

  // Verificar se parece com bot/script
  const botPatterns = [
    'curl', 'wget', 'python', 'node', 'postman', 
    'insomnia', 'httpie', 'bot', 'crawler'
  ];
  
  if (botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
    patterns.push('BOT_OR_SCRIPT_DETECTED');
    score += 30;
  }

  // Verificar headers inconsistentes
  if (!acceptLanguage || !acceptEncoding) {
    patterns.push('MISSING_BROWSER_HEADERS');
    score += 15;
  }

  return { score, patterns };
};

const analyzePaymentPattern = async (
  supabase: any,
  planType: string,
  amount: number
): Promise<{ score: number; patterns: string[] }> => {
  const patterns: string[] = [];
  let score = 0;

  // Verificar se o valor está muito fora do esperado
  const expectedRanges = {
    professional_monthly: { min: 8000, max: 9500 }, // R$ 80-95
    professional_annual: { min: 85000, max: 95000 }, // R$ 850-950
    premium_monthly: { min: 17000, max: 19000 }, // R$ 170-190
    premium_annual: { min: 175000, max: 185000 }, // R$ 1750-1850
  };

  const expectedRange = expectedRanges[planType as keyof typeof expectedRanges];
  
  if (expectedRange) {
    if (amount < expectedRange.min || amount > expectedRange.max) {
      patterns.push('AMOUNT_OUTSIDE_EXPECTED_RANGE');
      
      // Quanto mais distante, maior o score
      const minDeviation = Math.abs(amount - expectedRange.min) / expectedRange.min;
      const maxDeviation = Math.abs(amount - expectedRange.max) / expectedRange.max;
      const deviation = Math.min(minDeviation, maxDeviation);
      
      score += Math.min(50, Math.floor(deviation * 100));
    }
  }

  return { score, patterns };
};

const calculateRiskLevel = (totalScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  if (totalScore >= 80) return 'CRITICAL';
  if (totalScore >= 60) return 'HIGH';
  if (totalScore >= 30) return 'MEDIUM';
  return 'LOW';
};

const getRecommendedAction = (
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
): 'ALLOW' | 'REVIEW' | 'BLOCK' => {
  switch (riskLevel) {
    case 'LOW': return 'ALLOW';
    case 'MEDIUM': return 'REVIEW';
    case 'HIGH': return 'REVIEW';
    case 'CRITICAL': return 'BLOCK';
  }
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
    logStep("Fraud detection analysis started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    const { planType, amount, sessionData } = await req.json();

    logStep("Analyzing user behavior");
    const userBehavior = await analyzeUserBehavior(supabaseClient, user.id);

    logStep("Analyzing device fingerprint");
    const deviceFingerprint = analyzeDeviceFingerprint(req);

    logStep("Analyzing payment pattern");
    const paymentPattern = await analyzePaymentPattern(supabaseClient, planType, amount);

    // Calcular score total
    const totalScore = userBehavior.score + deviceFingerprint.score + paymentPattern.score;
    const allPatterns = [
      ...userBehavior.patterns,
      ...deviceFingerprint.patterns,
      ...paymentPattern.patterns
    ];

    const riskLevel = calculateRiskLevel(totalScore);
    const recommendedAction = getRecommendedAction(riskLevel);

    const analysis: FraudAnalysis = {
      riskScore: Math.min(100, totalScore),
      riskLevel,
      detectedPatterns: allPatterns,
      recommendedAction,
      details: {
        userBehavior,
        paymentPattern,
        deviceFingerprint
      }
    };

    logStep("Fraud analysis complete", {
      userId: user.id,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      recommendedAction: analysis.recommendedAction,
      patternsDetected: allPatterns.length
    });

    // Log da análise
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'FRAUD_ANALYSIS',
      table_name: 'fraud_detection',
      reason: `Risk Level: ${riskLevel} - Score: ${analysis.riskScore}`,
      new_data: {
        ...analysis,
        plan_type: planType,
        attempted_amount: amount,
        ip_address: req.headers.get('cf-connecting-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in fraud detection", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: "Fraud detection analysis failed",
      details: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});