
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
};

// Define the database schema for notes table to fix TypeScript errors
type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          user_id: string;
          title: string;
          content: string;
        };
        Update: {
          title?: string;
          content?: string;
          updated_at?: string;
        };
      };
    };
  };
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar notas:", error);
      toast.error("Erro ao carregar notas: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, content: string) => {
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
          content 
        }])
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      toast.success("Nota criada com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Erro ao criar nota:", error);
      toast.error("Erro ao criar nota: " + (error.message || "Erro desconhecido"));
      return null;
    }
  };

  const updateNote = async (id: string, title: string, content: string) => {
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
      const { error } = await (supabase as any)
        .from('notes')
        .update({ 
          title, 
          content, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(notes.map(note => 
        note.id === id ? { ...note, title, content } : note
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
