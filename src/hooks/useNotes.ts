
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export type Note = {
  id: string;
  title: string;
  content: string;
  client_id: string | null;
  client_name?: string | null;
  created_at: string;
  updated_at?: string;
};

export const useNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      // Cast supabase to use our custom Database type
      const { data, error } = await (supabase as any)
        .from('notes')
        .select('*, clients(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mapped: Note[] = (data || []).map((row: any) => ({
        ...row,
        client_name: row.clients?.name ?? null,
      }));
      setNotes(mapped);
    } catch (error: any) {
      console.error("Erro ao carregar notas:", error);
      toast.error("Erro ao carregar notas: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, content: string, clientId?: string | null) => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return null;
      }

      if (!title.trim()) {
        toast.error("O título é obrigatório");
        return null;
      }

      // Cast supabase to use our custom Database type
      const { data, error } = await (supabase as any)
        .from('notes')
        .insert([{
          user_id: user.id,
          title,
          content,
          client_id: clientId || null,
        }])
        .select('*, clients(name)')
        .single();

      if (error) throw error;

      const note: Note = { ...data, client_name: data.clients?.name ?? null };
      setNotes([note, ...notes]);
      toast.success("Nota criada com sucesso!");
      return note;
    } catch (error: any) {
      console.error("Erro ao criar nota:", error);
      toast.error("Erro ao criar nota: " + (error.message || "Erro desconhecido"));
      return null;
    }
  };

  const updateNote = async (id: string, title: string, content: string, clientId?: string | null) => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return false;
      }

      if (!title.trim()) {
        toast.error("O título é obrigatório");
        return false;
      }

      // Cast supabase to use our custom Database type
      // updated_at é preenchido automaticamente pelo trigger update_notes_updated_at no banco
      const { data, error } = await (supabase as any)
        .from('notes')
        .update({ title, content, client_id: clientId === undefined ? undefined : (clientId || null) })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*, clients(name)')
        .single();

      if (error) throw error;

      setNotes(notes.map(note =>
        note.id === id
          ? { ...note, title, content, client_id: data.client_id, client_name: data.clients?.name ?? null, updated_at: data.updated_at }
          : note
      ));
      
      toast.success("Nota atualizada com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar nota:", error);
      toast.error("Erro ao atualizar nota: " + (error.message || "Erro desconhecido"));
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      // Cast supabase to use our custom Database type
      const { error } = await (supabase as any)
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== id));
      toast.success("Nota excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir nota:", error);
      toast.error("Erro ao excluir nota: " + (error.message || "Erro desconhecido"));
    }
  };

  return {
    notes,
    loading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote
  };
};
