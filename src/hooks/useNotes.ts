
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

// Use tipos personalizados para superar as limitações da definição automática de tipos do Supabase
type SupabaseNote = Note & {
  user_id: string;
  updated_at?: string;
};

export const useNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('notes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar notas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, content: string) => {
    try {
      if (!title.trim()) {
        toast.error("O título é obrigatório");
        return;
      }

      const { data, error } = await supabase
        .from('notes' as any)
        .insert([{ user_id: user?.id, title, content }] as any)
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      toast.success("Nota criada com sucesso!");
      return data;
    } catch (error: any) {
      toast.error("Erro ao criar nota: " + error.message);
      return null;
    }
  };

  const updateNote = async (id: string, title: string, content: string) => {
    try {
      if (!title.trim()) {
        toast.error("O título é obrigatório");
        return false;
      }

      const { error } = await supabase
        .from('notes' as any)
        .update({ title, content, updated_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.map(note => 
        note.id === id ? { ...note, title, content } : note
      ));
      
      toast.success("Nota atualizada com sucesso!");
      return true;
    } catch (error: any) {
      toast.error("Erro ao atualizar nota: " + error.message);
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== id));
      toast.success("Nota excluída com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao excluir nota: " + error.message);
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
