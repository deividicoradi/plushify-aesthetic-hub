import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CashStatusContextType {
  isOpen: boolean;
  currentOpening: any;
  canOpenCash: boolean;
  canCloseCash: boolean;
  refreshStatus: () => void;
}

const CashStatusContext = createContext<CashStatusContextType | undefined>(undefined);

export const useCashStatus = () => {
  const context = useContext(CashStatusContext);
  if (!context) {
    throw new Error('useCashStatus must be used within a CashStatusProvider');
  }
  return context;
};

interface CashStatusProviderProps {
  children: React.ReactNode;
}

export const CashStatusProvider: React.FC<CashStatusProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentOpening, setCurrentOpening] = useState(null);

  const { data: openings, refetch } = useQuery({
    queryKey: ['cash-status', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('cash_openings')
        .select('*')
        .eq('user_id', user?.id)
        .eq('opening_date', today)
        .eq('status', 'aberto')
        .order('opened_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (openings && openings.length > 0) {
      setIsOpen(true);
      setCurrentOpening(openings[0]);
    } else {
      setIsOpen(false);
      setCurrentOpening(null);
    }
  }, [openings]);

  const canOpenCash = !isOpen;
  const canCloseCash = isOpen && currentOpening;

  const refreshStatus = () => {
    refetch();
  };

  return (
    <CashStatusContext.Provider value={{
      isOpen,
      currentOpening,
      canOpenCash,
      canCloseCash,
      refreshStatus,
    }}>
      {children}
    </CashStatusContext.Provider>
  );
};