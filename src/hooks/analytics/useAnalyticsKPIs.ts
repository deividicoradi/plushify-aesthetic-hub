import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsClientRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  created_at: string;
}

export interface AnalyticsRevenueRow {
  id: string;
  description: string | null;
  amount: number;
  payment_date: string | null;
  created_at: string;
  status: string;
  client_name: string | null;
  payment_method_name: string | null;
}

export interface AnalyticsAppointmentRow {
  id: string;
  client_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  price: number;
  professional_id: string | null;
  professional_name: string | null;
}

export interface AnalyticsKPIsData {
  clients: AnalyticsClientRow[];
  revenues: AnalyticsRevenueRow[];
  appointments: AnalyticsAppointmentRow[];
  totalClients: number;
  monthlyRevenue: number;
  weeklyAppointments: number;
  ticketMedio: number;
  ticketCount: number;
  ticketSum: number;
}

interface Range {
  startDate: Date;
  endDate: Date;
}

export const useAnalyticsKPIs = (range: Range) => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsKPIsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fromISO = range.startDate.toISOString();
  const toISO = range.endDate.toISOString();
  const fromDate = range.startDate.toISOString().slice(0, 10);
  const toDate = range.endDate.toISOString().slice(0, 10);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const [clientsRes, paymentsRes, methodsRes, apptsRes, profsRes] = await Promise.all([
          supabase
            .from('clients')
            .select('id, name, email, phone, status, created_at')
            .eq('user_id', user.id)
            .gte('created_at', fromISO)
            .lte('created_at', toISO),
          supabase
            .from('payments')
            .select('id, description, amount, payment_date, created_at, status, client_id, payment_method_id')
            .eq('user_id', user.id)
            .eq('status', 'pago')
            .gte('payment_date', fromISO)
            .lte('payment_date', toISO),
          supabase.from('payment_methods').select('id, name').eq('user_id', user.id),
          supabase
            .from('appointments')
            .select('id, client_name, service_name, appointment_date, appointment_time, status, price, professional_id, client_id')
            .eq('user_id', user.id)
            .gte('appointment_date', fromDate)
            .lte('appointment_date', toDate),
          supabase.from('professionals').select('id, name').eq('user_id', user.id),
        ]);

        // Client lookup for revenue rows
        const clientMap = new Map<string, string>();
        const { data: allClients } = await supabase
          .from('clients')
          .select('id, name')
          .eq('user_id', user.id);
        (allClients || []).forEach((c: any) => clientMap.set(c.id, c.name));

        const methodMap = new Map<string, string>();
        (methodsRes.data || []).forEach((m: any) => methodMap.set(m.id, m.name));

        const profMap = new Map<string, string>();
        (profsRes.data || []).forEach((p: any) => profMap.set(p.id, p.name));

        const clients: AnalyticsClientRow[] = (clientsRes.data || []) as any;

        const revenues: AnalyticsRevenueRow[] = (paymentsRes.data || []).map((p: any) => ({
          id: p.id,
          description: p.description,
          amount: Number(p.amount) || 0,
          payment_date: p.payment_date,
          created_at: p.created_at,
          status: p.status,
          client_name: p.client_id ? clientMap.get(p.client_id) ?? null : null,
          payment_method_name: methodMap.get(p.payment_method_id) ?? null,
        }));

        const appointments: AnalyticsAppointmentRow[] = (apptsRes.data || []).map((a: any) => ({
          id: a.id,
          client_name: a.client_name,
          service_name: a.service_name,
          appointment_date: a.appointment_date,
          appointment_time: a.appointment_time,
          status: a.status,
          price: Number(a.price) || 0,
          professional_id: a.professional_id,
          professional_name: a.professional_id ? profMap.get(a.professional_id) ?? null : null,
        }));

        const monthlyRevenue = revenues.reduce((s, r) => s + r.amount, 0);
        const ticketCount = revenues.length;
        const ticketMedio = ticketCount > 0 ? monthlyRevenue / ticketCount : 0;

        if (!cancelled) {
          setData({
            clients,
            revenues,
            appointments,
            totalClients: clients.length,
            monthlyRevenue,
            weeklyAppointments: appointments.length,
            ticketMedio,
            ticketCount,
            ticketSum: monthlyRevenue,
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
  }, [user, fromISO, toISO, fromDate, toDate]);

  return { data, loading };
};