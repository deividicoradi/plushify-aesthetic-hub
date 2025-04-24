
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DashboardLayout from '@/components/DashboardLayout';
import { CreateNoteForm } from '@/components/notes/CreateNoteForm';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNotes } from '@/hooks/useNotes';

const Notes = () => {
  const { notes, loading, fetchNotes, createNote, updateNote, deleteNote } = useNotes();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (title: string, content: string) => {
    const note = await createNote(title, content);
    if (note) {
      setCreating(false);
    }
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
            <Plus className="mr-2" />
            {creating ? "Cancelar" : "Nova Nota"}
          </Button>
        </div>

        {creating && (
          <CreateNoteForm 
            onSubmit={handleCreateNote}
            onCancel={() => setCreating(false)}
          />
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
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={updateNote}
                onDelete={deleteNote}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notes;
