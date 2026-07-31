
import React, { useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { TodayOverview } from '@/components/dashboard/TodayOverview';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { checkSubscriptionStatus } = useSubscription();
  const { toast } = useToast();

  // Retorno do checkout da AbacatePay (abacate-create-checkout/abacate-create-subscription
  // usam completionUrl=/dashboard?success=true) — usuário já está logado, então
  // mostramos a confirmação aqui em vez de mandá-lo de volta pra tela de vendas (/planos).
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const plan = urlParams.get('plan');
      const billing = urlParams.get('billing');
      const billingText = billing === 'annual' ? 'anual' : 'mensal';
      toast({
        title: 'Pagamento realizado com sucesso!',
        description: `Bem-vindo ao plano ${plan} ${billingText}!`,
      });
      checkSubscriptionStatus();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, checkSubscriptionStatus]);

  return (
    <ResponsiveLayout
      title="Dashboard"
      subtitle="Visão geral do seu negócio"
      icon={BarChart3}
    >
      <TodayOverview />
      <DashboardContent />
    </ResponsiveLayout>
  );
};

export default Dashboard;
