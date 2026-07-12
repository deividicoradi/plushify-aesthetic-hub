import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ReportsMetricKey =
  | 'totalClients'
  | 'totalRevenue'
  | 'totalAppointments'
  | 'totalProducts';

export interface ClientRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  created_at: string;
}

export interface PaymentDetailRow {
  id: string;
  description: string | null;
  paid_amount: number;
  payment_date: string | null;
  created_at: string;
  status: string;
  clients?: { name: string | null } | null;
  payment_methods?: { name: string | null } | null;
}

export interface CashClosureDetailRow {
  id: string;
  closure_date: string;
  total_income: number;
}

export interface AppointmentDetailRow {
  id: string;
  client_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  price: number;
  professional_id: string | null;
  created_at: string;
  professionals?: { name: string | null } | null;
}

export interface ProductDetailRow {
  id: string;
  name: string;
  category: string | null;
  stock_quantity: number;
  min_stock_level: number | null;
  price: number;
  active: boolean;
  created_at: string;
}

export interface ReportsDetailsData {
  clients: ClientRow[];
  payments: PaymentDetailRow[];
  cashClosures: CashClosureDetailRow[];
  appointments: AppointmentDetailRow[];
  products: ProductDetailRow[];
}

/**
 * Fetches detail records for the Reports cards on demand. `metric` decides
 * which datasets to load so we don't over-fetch. When metric is null the hook
 * stays idle.
 */
export const useReportsDetails = (metric: ReportsMetricKey | null) => {
  const { user } = useAuth();
  const [data, setData] = useState<ReportsDetailsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !metric) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      const empty: ReportsDetailsData = {
        clients: [],
        payments: [],
        cashClosures: [],
        appointments: [],
        products: [],
      };

      try {
        if (metric === 'totalClients') {
          const { data: clients } = await supabase.rpc('get_clients_masked', {
            p_mask_sensitive: false,
          });
          if (!cancelled)
            setData({
              ...empty,
              clients: (clients || []) as ClientRow[],
            });
        } else if (metric === 'totalRevenue') {
          const [paymentsRes, cashRes] = await Promise.all([
            supabase
              .from('payments')
              .select(
                'id, description, paid_amount, payment_date, created_at, status, clients(name), payment_methods(name)'
              )
              .eq('user_id', user.id)
              .eq('status', 'pago'),
            supabase
              .from('cash_closures')
              .select('id, closure_date, total_income')
              .eq('user_id', user.id),
          ]);
          if (!cancelled)
            setData({
              ...empty,
              payments: (paymentsRes.data || []) as PaymentDetailRow[],
              cashClosures: (cashRes.data || []) as CashClosureDetailRow[],
            });
        } else if (metric === 'totalAppointments') {
          const { data: appts } = await supabase
            .from('appointments')
            .select(
              'id, client_name, service_name, appointment_date, appointment_time, status, price, professional_id, created_at, professionals(name)'
            )
            .eq('user_id', user.id);
          if (!cancelled)
            setData({
              ...empty,
              appointments: (appts || []) as AppointmentDetailRow[],
            });
        } else if (metric === 'totalProducts') {
          const { data: products } = await supabase
            .from('products')
            .select(
              'id, name, category, stock_quantity, min_stock_level, price, active, created_at'
            )
            .eq('user_id', user.id);
          if (!cancelled)
            setData({
              ...empty,
              products: (products || []) as ProductDetailRow[],
            });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [user, metric]);

  return { data, loading };
};