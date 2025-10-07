
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText } from "lucide-react";
import { CreateNoteForm } from '@/components/notes/CreateNoteForm';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNotes } from '@/hooks/useNotes';
import { Input } from "@/components/ui/input";
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

const Notes = () => {
  const { notes, loading, fetchNotes, createNote, updateNote, deleteNote } = useNotes();
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    fetchNotes();
  }, []);
  
  const handleCreateNote = async (title: string, content: string) => {
    const note = await createNote(title, content);
    if (note) {
      setCreating(false);
    }
  };
  
  // Filtra as notas com base no termo de busca
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ResponsiveLayout
      title="Minhas Anotações"
      subtitle="Organize suas ideias e lembretes"
      icon={FileText}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notas..." 
              className="pl-10 h-11 sm:h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full justify-end">
            <Button 
              onClick={() => setCreating(!creating)} 
              variant={creating ? "outline" : "default"}
              className="gap-2 touch-target"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{creating ? "Cancelar" : "Nova Nota"}</span>
              <span className="sm:hidden">{creating ? "Cancelar" : "Novo"}</span>
            </Button>
          </div>
        </div>

        {creating && (
          <CreateNoteForm 
            onSubmit={handleCreateNote}
            onCancel={() => setCreating(false)}
          />
        )}

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center my-12 text-muted-foreground bg-muted/20 dark:bg-muted/10 rounded-lg p-8 border border-dashed border-border animate-in fade-in duration-300">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {searchTerm ? (
              <p>Nenhuma nota encontrada com o termo "{searchTerm}".</p>
            ) : (
              <>
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
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {filteredNotes.map((note) => (
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
    </ResponsiveLayout>
  );
};

export default Notes;
