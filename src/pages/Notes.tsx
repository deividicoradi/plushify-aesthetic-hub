
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { Plus, Edit, Trash, Save, X } from "lucide-react";
import DashboardLayout from '@/components/DashboardLayout';

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    try {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
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

  const createNote = async () => {
    try {
      if (!title.trim()) {
        toast.error("O título é obrigatório");
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([{ user_id: user?.id, title, content }])
        .select();

      if (error) throw error;

      setNotes([data[0], ...notes]);
      setTitle('');
      setContent('');
      setCreating(false);
      toast.success("Nota criada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao criar nota: " + error.message);
    }
  };

  const startEditing = (note: Note) => {
    setEditing(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditing(null);
    setEditTitle('');
    setEditContent('');
  };

  const updateNote = async (id: string) => {
    try {
      if (!editTitle.trim()) {
        toast.error("O título é obrigatório");
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .update({ title: editTitle, content: editContent, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (error) throw error;

      setNotes(notes.map(note => note.id === id ? data[0] : note));
      setEditing(null);
      toast.success("Nota atualizada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar nota: " + error.message);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== id));
      toast.success("Nota excluída com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao excluir nota: " + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Minhas Anotações</h1>
          <Button 
            onClick={() => setCreating(!creating)} 
            variant={creating ? "outline" : "default"}
            className={!creating ? "bg-plush-600 hover:bg-plush-700" : ""}
          >
            {creating ? <X className="mr-2" /> : <Plus className="mr-2" />}
            {creating ? "Cancelar" : "Nova Nota"}
          </Button>
        </div>

        {creating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nova Nota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Título da nota"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Conteúdo da nota..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={createNote}
                className="bg-plush-600 hover:bg-plush-700"
              >
                <Save className="mr-2" />
                Salvar Nota
              </Button>
            </CardFooter>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-plush-600"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center my-12 text-muted-foreground">
            <p>Você ainda não tem nenhuma anotação.</p>
            {!creating && (
              <Button 
                onClick={() => setCreating(true)} 
                variant="outline" 
                className="mt-4"
              >
                <Plus className="mr-2" />
                Criar sua primeira nota
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Card key={note.id} className="flex flex-col">
                <CardHeader>
                  {editing === note.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="font-bold"
                    />
                  ) : (
                    <CardTitle>{note.title}</CardTitle>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(note.created_at)}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow">
                  {editing === note.id ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={5}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{note.content}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {editing === note.id ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelEditing}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-plush-600 hover:bg-plush-700"
                        onClick={() => updateNote(note.id)}
                      >
                        <Save className="mr-1 h-4 w-4" />
                        Salvar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => startEditing(note)}
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash className="mr-1 h-4 w-4" />
                        Excluir
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notes;
