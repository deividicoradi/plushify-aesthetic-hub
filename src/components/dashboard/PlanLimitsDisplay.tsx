import React from 'react';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useClientStats } from '@/hooks/useClientStats';
import { useAppointments } from '@/hooks/useAppointments';
import { useProductsData } from '@/hooks/inventory/useProductsData';
import { useServices } from '@/hooks/useServices';
import { Infinity as InfinityIcon, Users, Calendar, Package, Settings, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlanLimitsDisplay = () => {
  const { currentPlan, getLimit, hasReachedLimit, isTestUser } = usePlanLimits();
  const { totalClients } = useClientStats();
  const { appointments } = useAppointments();
  const { products } = useProductsData();
  const { services } = useServices();
  const navigate = useNavigate();

  const limits = [
    { type: 'clients' as const, current: totalClients, label: 'Clientes', Icon: Users },
    { type: 'appointments' as const, current: appointments.length, label: 'Agendamentos', Icon: Calendar },
    { type: 'products' as const, current: products.length, label: 'Produtos', Icon: Package },
    { type: 'services' as const, current: services.length, label: 'Serviços', Icon: Settings },
  ];

  const planLabel =
    currentPlan === 'trial' ? 'GRÁTIS' : currentPlan === 'professional' ? 'Professional' : 'Premium';

  if (isTestUser) {
    return (
      <div className="relative overflow-hidden bg-[#1a1322] border border-white/5 rounded-3xl p-6">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D65E9A]/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="p-2 bg-[#D65E9A]/10 rounded-xl">
            <Sparkles className="w-5 h-5 text-[#D65E9A]" />
          </div>
          <div>
            <h3 className="text-white font-semibold font-[Sora,system-ui,sans-serif]">
              Modo de Teste — Acesso Completo
            </h3>
            <p className="text-gray-400 text-sm mt-0.5">
              Você tem acesso ilimitado a todas as funcionalidades.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#1a1322] border border-white/5 rounded-3xl p-6 md:p-8">
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#D65E9A]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-lg md:text-xl font-bold font-[Sora,system-ui,sans-serif]">
            Limites do Plano
          </h2>
          <p className="text-gray-400 text-xs mt-1">Acompanhe o uso dos seus recursos</p>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#D65E9A]/15 text-[#D65E9A] border border-[#D65E9A]/30">
          {planLabel}
        </span>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {limits.map(({ type, current, label, Icon }) => {
          const limit = getLimit(type);
          const isAtLimit = hasReachedLimit(type, current);
          const isUnlimited = limit === -1;
          const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
          const danger = isAtLimit;
          const warning = !isUnlimited && percentage >= 80 && !danger;

          return (
            <div key={type} className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-300">
                  <Icon className="w-4 h-4 text-[#D65E9A]/80" />
                  {label}
                </span>
                <span className="text-white font-medium tabular-nums">
                  {current}
                  {isUnlimited ? (
                    <InfinityIcon className="w-4 h-4 inline ml-1 text-emerald-400" />
                  ) : (
                    <span className="text-gray-500"> / {limit}</span>
                  )}
                </span>
              </div>
              {!isUnlimited && (
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      danger
                        ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                        : warning
                        ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]'
                        : 'bg-[#D65E9A] shadow-[0_0_12px_rgba(214,94,154,0.45)]'
                    }`}
                    style={{ width: `${Math.max(percentage, isUnlimited ? 0 : 4)}%` }}
                  />
                </div>
              )}
              {isUnlimited && (
                <div className="w-full h-1.5 bg-emerald-400/15 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {currentPlan !== 'premium' && (
        <button
          onClick={() => navigate('/app/planos')}
          className="relative mt-7 w-full py-3 bg-[#D65E9A] hover:bg-[#c44d87] text-white font-semibold rounded-2xl transition-all shadow-lg shadow-[#D65E9A]/20"
        >
          Fazer Upgrade do Plano
        </button>
      )}
    </div>
  );
};
