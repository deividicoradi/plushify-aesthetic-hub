
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as paymentMethodsApi from '@/api/paymentMethods';

export const usePaymentMethods = (enabled: boolean = true) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: () => paymentMethodsApi.fetchPaymentMethods(user!.id),
    enabled: !!user?.id && enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
