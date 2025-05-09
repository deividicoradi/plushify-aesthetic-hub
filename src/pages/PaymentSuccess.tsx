
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { fetchSubscription, tier, isSubscribed } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkPayment = async () => {
      if (!user) return;
      
      try {
        await fetchSubscription();
        setIsLoading(false);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setIsLoading(false);
      }
    };
    
    checkPayment();
    
    // Check payment status every 3 seconds for up to 30 seconds
    const intervalId = setInterval(checkPayment, 3000);
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setIsLoading(false);
    }, 30000);
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [user]);
  
  // Get the plan name based on tier
  const getPlanName = () => {
    switch (tier) {
      case 'starter': return 'Starter';
      case 'pro': return 'Pro';
      case 'premium': return 'Premium';
      default: return 'Free';
    }
  };
  
  return (
    <div className="min-h-screen pt-20 pb-10 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-plush-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-plush-600 w-9 h-9" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 font-serif">Pagamento Confirmado!</h1>
          
          {isLoading ? (
            <p className="text-gray-500 mb-6">Verificando seu pagamento...</p>
          ) : isSubscribed ? (
            <>
              <p className="text-gray-500 mb-1">
                Parabéns! Sua assinatura do plano <span className="font-medium text-plush-700">{getPlanName()}</span> foi ativada com sucesso.
              </p>
              <p className="text-gray-500 mb-6">
                Você já pode começar a aproveitar todos os benefícios do seu novo plano agora mesmo.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-1">
                Seu pagamento foi recebido, mas pode levar alguns minutos para que sua assinatura seja ativada.
              </p>
              <p className="text-gray-500 mb-6">
                Caso não seja ativada automaticamente, entre em contato com nosso suporte.
              </p>
            </>
          )}
          
          <div className="space-y-3 w-full">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full bg-plush-600 hover:bg-plush-700"
            >
              Ir para o Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/planos')} 
              variant="outline" 
              className="w-full border-plush-200 text-plush-700 hover:bg-plush-50"
            >
              Voltar para Planos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
