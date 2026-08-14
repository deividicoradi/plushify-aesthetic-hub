import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// types.ts ainda não foi regenerado pra incluir as funções admin_finance_*
// (não há CLI/conexão de banco neste ambiente pra rodar `supabase gen
// types`) — mesmo padrão de bypass já usado em useProfile.ts pra tabelas
// novas até a próxima regeneração.
const sb: any = supabase;

export type FinanceCategory =
  | 'infraestrutura'
  | 'marketing'
  | 'folha_pro_labore'
  | 'impostos'
  | 'taxas_gateway'
  | 'juridico_contabilidade'
  | 'ferramentas_software'
  | 'outros';

export type FinanceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type FinanceRecurrence = 'none' | 'monthly' | 'yearly';

export interface FinanceEntry {
  id: string;
  description: string;
  category: FinanceCategory;
  amount: number;
  due_date: string;
  status: FinanceStatus;
  recurrence: FinanceRecurrence;
  paid_at: string | null;
  payment_method: string | null;
  attachment_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceEntryInput {
  description: string;
  category: FinanceCategory;
  amount: number;
  due_date: string;
  recurrence?: FinanceRecurrence;
  notes?: string | null;
  attachment_url?: string | null;
}

export interface FinanceSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  byCategory: { category: FinanceCategory; total: number }[];
}

export const CATEGORY_LABELS: Record<FinanceCategory, string> = {
  infraestrutura: 'Infraestrutura',
  marketing: 'Marketing',
  folha_pro_labore: 'Folha / Pró-labore',
  impostos: 'Impostos',
  taxas_gateway: 'Taxas de gateway',
  juridico_contabilidade: 'Jurídico / Contábil',
  ferramentas_software: 'Ferramentas / Software',
  outros: 'Outros',
};

export const STATUS_LABELS: Record<FinanceStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
};

interface Filters {
  status?: FinanceStatus | 'todos';
  category?: FinanceCategory | 'todas';
  from?: string;
  to?: string;
  enabled?: boolean;
}

export const useAdminFinance = (filters: Filters = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['admin-finance-entries', filters];

  const { data: entries = [], isLoading: loading, refetch } = useQuery({
    queryKey,
    enabled: filters.enabled ?? true,
    queryFn: async (): Promise<FinanceEntry[]> => {
      const { data, error } = await sb.rpc('admin_list_finance_entries', {
        p_status: !filters.status || filters.status === 'todos' ? null : filters.status,
        p_category: !filters.category || filters.category === 'todas' ? null : filters.category,
        p_from: filters.from ?? null,
        p_to: filters.to ?? null,
        p_limit: 500,
        p_offset: 0,
      });
      if (error) throw error;
      return data || [];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-finance-entries'] });

  const createEntry = useCallback(async (input: FinanceEntryInput) => {
    const { error } = await sb.rpc('admin_create_finance_entry', {
      p_description: input.description,
      p_category: input.category,
      p_amount: input.amount,
      p_due_date: input.due_date,
      p_recurrence: input.recurrence ?? 'none',
      p_notes: input.notes ?? null,
      p_attachment_url: input.attachment_url ?? null,
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Lançamento criado' });
    invalidate();
    return true;
  }, []);

  const updateEntry = useCallback(async (id: string, input: FinanceEntryInput) => {
    const { error } = await sb.rpc('admin_update_finance_entry', {
      p_id: id,
      p_description: input.description,
      p_category: input.category,
      p_amount: input.amount,
      p_due_date: input.due_date,
      p_recurrence: input.recurrence ?? 'none',
      p_notes: input.notes ?? null,
      p_attachment_url: input.attachment_url ?? null,
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Lançamento atualizado' });
    invalidate();
    return true;
  }, []);

  const markPaid = useCallback(async (id: string, paymentMethod?: string) => {
    const { error } = await sb.rpc('admin_mark_finance_entry_paid', {
      p_id: id,
      p_payment_method: paymentMethod ?? null,
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Marcado como pago' });
    invalidate();
    return true;
  }, []);

  const cancelEntry = useCallback(async (id: string) => {
    const { error } = await sb.rpc('admin_cancel_finance_entry', { p_id: id });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Lançamento cancelado' });
    invalidate();
    return true;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await sb.rpc('admin_delete_finance_entry', { p_id: id });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Lançamento excluído' });
    invalidate();
    return true;
  }, []);

  return { entries, loading, refetch, createEntry, updateEntry, markPaid, cancelEntry, deleteEntry };
};

export const useAdminFinanceSummary = (month: string) => {
  const monthDate = new Date(`${month}-01T00:00:00`);
  const fromDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().slice(0, 10);
  const toDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['admin-finance-summary', month],
    queryFn: async (): Promise<FinanceSummary> => {
      const { data, error } = await sb.rpc('admin_get_finance_summary', {
        p_from: fromDate,
        p_to: toDate,
      });
      if (error) throw error;

      const rows = data || [];
      const summary: FinanceSummary = {
        totalPaid: rows[0]?.total_paid ?? 0,
        totalPending: rows[0]?.total_pending ?? 0,
        totalOverdue: rows[0]?.total_overdue ?? 0,
        byCategory: rows
          .filter((r: any) => r.category)
          .map((r: any) => ({ category: r.category, total: r.category_total })),
      };
      return summary;
    },
  });

  return { summary: data, loading };
};
