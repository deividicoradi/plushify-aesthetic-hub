import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const sb: any = supabase;

export interface FinanceNote {
  id: string;
  title: string;
  content: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceNoteInput {
  title: string;
  content?: string | null;
  pinned?: boolean;
}

export const useAdminFinanceNotes = () => {
  const queryClient = useQueryClient();
  const queryKey = ['admin-finance-notes'];

  const { data: notes = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async (): Promise<FinanceNote[]> => {
      const { data, error } = await sb.rpc('admin_list_finance_notes');
      if (error) throw error;
      return data || [];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createNote = useCallback(async (input: FinanceNoteInput) => {
    const { error } = await sb.rpc('admin_create_finance_note', {
      p_title: input.title,
      p_content: input.content ?? null,
      p_pinned: input.pinned ?? false,
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return false;
    }
    invalidate();
    return true;
  }, []);

  const updateNote = useCallback(async (id: string, input: FinanceNoteInput) => {
    const { error } = await sb.rpc('admin_update_finance_note', {
      p_id: id,
      p_title: input.title,
      p_content: input.content ?? null,
      p_pinned: input.pinned ?? false,
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return false;
    }
    invalidate();
    return true;
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await sb.rpc('admin_delete_finance_note', { p_id: id });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Anotação removida' });
    invalidate();
    return true;
  }, []);

  return { notes, loading, createNote, updateNote, deleteNote };
};
