import { usePlanLimits } from './usePlanLimits';
import { useTeamMembers } from './useTeamMembers';
import { useToast } from './use-toast';

export const useTeamLimits = () => {
  const { getUserLimitsInfo, hasReachedLimit, loading: planLoading } = usePlanLimits();
  const { teamMembers, loading: teamLoading } = useTeamMembers();
  const { toast } = useToast();

  // Só quem realmente ocupa uma vaga do plano (opera o sistema) conta pro
  // limite — profissionais cadastrados só pra aparecer na agenda/serviço,
  // sem acesso ao sistema, não devem esbarrar no limite de usuários.
  const activeTeamMembers = teamMembers.filter(member => member.status === 'active' && member.counts_as_seat);
  const currentActiveUsers = activeTeamMembers.length;
  
  const { activeUsersLimit, canAddUsers, upgradeMessage } = getUserLimitsInfo();

  const checkUserLimit = (): boolean => {
    const reachedLimit = hasReachedLimit('activeUsers', currentActiveUsers);
    
    if (reachedLimit) {
      toast({
        title: "Limite atingido",
        description: upgradeMessage,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const getUserLimitInfo = () => {
    if (activeUsersLimit === -1) {
      return {
        current: currentActiveUsers,
        limit: 'Ilimitado',
        canAdd: true,
        percentage: 0
      };
    }

    return {
      current: currentActiveUsers,
      limit: activeUsersLimit,
      canAdd: currentActiveUsers < activeUsersLimit,
      percentage: Math.round((currentActiveUsers / activeUsersLimit) * 100)
    };
  };

  const getUpgradeInfo = () => {
    switch (activeUsersLimit) {
      case 1:
        return {
          currentPlan: 'Trial',
          suggestedPlan: 'Professional',
          suggestedLimit: '2 usuários'
        };
      case 2:
        return {
          currentPlan: 'Professional',
          suggestedPlan: 'Premium',
          suggestedLimit: '5 usuários'
        };
      default:
        return {
          currentPlan: 'Premium',
          suggestedPlan: null,
          suggestedLimit: null
        };
    }
  };

  return {
    currentActiveUsers,
    activeUsersLimit,
    loading: planLoading || teamLoading,
    checkUserLimit,
    getUserLimitInfo,
    getUpgradeInfo,
    canAddUsers,
    upgradeMessage
  };
};