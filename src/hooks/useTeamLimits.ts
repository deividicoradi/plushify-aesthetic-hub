import { usePlanLimits } from './usePlanLimits';
import { useTeamMembers } from './useTeamMembers';
import { useToast } from './use-toast';

export const useTeamLimits = () => {
  const { getUserLimitsInfo, hasReachedLimit } = usePlanLimits();
  const { teamMembers } = useTeamMembers();
  const { toast } = useToast();

  const activeTeamMembers = teamMembers.filter(member => member.status === 'active');
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
          suggestedPlan: 'Enterprise',
          suggestedLimit: '5 usuários'
        };
      default:
        return {
          currentPlan: 'Enterprise',
          suggestedPlan: null,
          suggestedLimit: null
        };
    }
  };

  return {
    currentActiveUsers,
    activeUsersLimit,
    checkUserLimit,
    getUserLimitInfo,
    getUpgradeInfo,
    canAddUsers,
    upgradeMessage
  };
};