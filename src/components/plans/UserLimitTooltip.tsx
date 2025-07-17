import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface UserLimitTooltipProps {
  planType: 'trial' | 'professional' | 'premium';
}

export const UserLimitTooltip: React.FC<UserLimitTooltipProps> = ({ planType }) => {
  const getTooltipContent = () => {
    switch (planType) {
      case 'trial':
        return (
          <div className="max-w-xs">
            <p className="font-medium mb-1">1 usuário ativo</p>
            <p className="text-xs">
              Durante o período de teste, apenas 1 pessoa pode acessar a plataforma.
            </p>
          </div>
        );
      case 'professional':
        return (
          <div className="max-w-xs">
            <p className="font-medium mb-1">Até 2 usuários ativos</p>
            <p className="text-xs">
              Perfeito para pequenos negócios. Você pode adicionar até 2 profissionais 
              com acesso completo à plataforma.
            </p>
          </div>
        );
      case 'premium':
        return (
          <div className="max-w-xs">
            <p className="font-medium mb-1">Até 5 usuários com acesso simultâneo</p>
            <p className="text-xs">
              Ideal para equipes maiores. Gerencie até 5 usuários ativos 
              com permissões personalizáveis e controle de acesso avançado.
            </p>
          </div>
        );
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-popover border border-border shadow-lg">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};