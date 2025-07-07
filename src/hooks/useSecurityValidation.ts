import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityValidationResult {
  valid: boolean;
  threatLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  officialAmount?: number;
  error?: string;
  message?: string;
}

interface FraudAnalysis {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedPatterns: string[];
  recommendedAction: 'ALLOW' | 'REVIEW' | 'BLOCK';
}

export const useSecurityValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validatePlanSecurity = async (
    planType: string,
    amount: number,
    currency: string = 'BRL'
  ): Promise<SecurityValidationResult> => {
    setIsValidating(true);
    
    try {
      console.log('🔒 Iniciando validação de segurança do plano', { planType, amount });

      // Primeira camada: Validação de segurança
      const { data: validationData, error: validationError } = await supabase.functions.invoke(
        'validate-plan-security',
        {
          body: { planType, amount, currency }
        }
      );

      if (validationError) {
        console.error('❌ Erro na validação de segurança:', validationError);
        return {
          valid: false,
          error: 'Falha na validação de segurança',
          threatLevel: 'HIGH'
        };
      }

      console.log('🔍 Resultado da validação:', validationData);

      // Se a validação falhou, não continuar
      if (!validationData.valid) {
        if (validationData.threatLevel === 'CRITICAL') {
          toast.error('Tentativa de violação de segurança detectada');
        } else {
          toast.error(validationData.error || 'Valor inválido para o plano selecionado');
        }
        
        return validationData;
      }

      // Segunda camada: Análise de fraude
      const { data: fraudData, error: fraudError } = await supabase.functions.invoke(
        'fraud-detection',
        {
          body: { 
            planType, 
            amount,
            sessionData: {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              language: navigator.language,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          }
        }
      );

      if (fraudError) {
        console.warn('⚠️ Erro na análise de fraude:', fraudError);
        // Continuar mesmo com erro na análise de fraude
      }

      const fraudAnalysis: FraudAnalysis = fraudData || {
        riskScore: 0,
        riskLevel: 'LOW',
        detectedPatterns: [],
        recommendedAction: 'ALLOW'
      };

      console.log('🕵️ Análise de fraude:', fraudAnalysis);

      // Decisão final baseada na análise de fraude
      if (fraudAnalysis.recommendedAction === 'BLOCK') {
        toast.error('Transação bloqueada por motivos de segurança');
        return {
          valid: false,
          error: 'Transação bloqueada por segurança',
          threatLevel: fraudAnalysis.riskLevel
        };
      }

      if (fraudAnalysis.recommendedAction === 'REVIEW' && fraudAnalysis.riskLevel === 'HIGH') {
        toast.warning('Transação marcada para revisão de segurança');
      }

      return {
        valid: true,
        officialAmount: validationData.officialAmount,
        threatLevel: fraudAnalysis.riskLevel,
        message: 'Validação de segurança aprovada'
      };

    } catch (error) {
      console.error('❌ Erro na validação de segurança:', error);
      toast.error('Erro na validação de segurança');
      
      return {
        valid: false,
        error: 'Erro interno na validação',
        threatLevel: 'HIGH'
      };
    } finally {
      setIsValidating(false);
    }
  };

  const validatePlanBeforeCheckout = async (
    planId: 'professional' | 'premium',
    billingPeriod: 'monthly' | 'annual'
  ): Promise<boolean> => {
    // Mapear para os valores corretos
    const planTypeMapping = {
      'professional_monthly': 8900,
      'professional_annual': 89000,
      'premium_monthly': 17900,
      'premium_annual': 179000,
    };

    const planType = `${planId}_${billingPeriod}` as keyof typeof planTypeMapping;
    const expectedAmount = planTypeMapping[planType];

    if (!expectedAmount) {
      toast.error('Plano inválido selecionado');
      return false;
    }

    console.log('🛡️ Validando plano antes do checkout:', { planId, billingPeriod, expectedAmount });

    const result = await validatePlanSecurity(planType, expectedAmount);
    
    if (!result.valid) {
      console.error('❌ Validação de segurança falhou:', result);
      return false;
    }

    console.log('✅ Validação de segurança aprovada');
    return true;
  };

  return {
    validatePlanSecurity,
    validatePlanBeforeCheckout,
    isValidating
  };
};