
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText } from "lucide-react";
import { CreateNoteForm } from '@/components/notes/CreateNoteForm';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNotes } from '@/hooks/useNotes';
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header with sidebar trigger */}
            <header className="flex items-center gap-4 border-b border-border bg-background px-4 py-2">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">Minhas Anotações</h1>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-8 bg-background dark:bg-background">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        placeholder="Buscar notas..." 
                        className="pl-8 pr-4 w-full bg-background border-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={() => setCreating(!creating)} 
                      variant={creating ? "outline" : "default"}
                      className={!creating ? "bg-primary hover:bg-primary/90 text-primary-foreground transition-colors" : ""}
                    >
                      <Plus className="mr-2" />
                      {creating ? "Cancelar" : "Nova Nota"}
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
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Notes;
