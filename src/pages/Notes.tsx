
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText } from "lucide-react";
import { CreateNoteForm } from '@/components/notes/CreateNoteForm';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNotes } from '@/hooks/useNotes';
import { useClients } from '@/hooks/useClients';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

const Notes = () => {
  const { notes, loading, fetchNotes, createNote, updateNote, deleteNote } = useNotes();
  const { clients } = useClients();
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (title: string, content: string, clientId: string | null) => {
    const note = await createNote(title, content, clientId);
    if (note) {
      setCreating(false);
    }
  };

  // Filtra as notas com base no termo de busca e no cliente vinculado
  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient =
      clientFilter === 'all' ||
      (clientFilter === 'none' ? !note.client_id : note.client_id === clientFilter);
    return matchesSearch && matchesClient;
  });

  return (
    <ResponsiveLayout
      title="Minhas Anotações"
      subtitle="Organize suas ideias e lembretes"
      icon={FileText}
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notas..." 
              className="pl-10 h-11 sm:h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full sm:w-56 h-11 sm:h-10">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              <SelectItem value="none">Sem cliente vinculado</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button 
              onClick={() => setCreating(!creating)} 
              variant={creating ? "outline" : "default"}
              className="gap-2 touch-target w-full sm:w-auto"
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
            clients={clients}
          />
        )}

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center my-8 sm:my-12 text-muted-foreground bg-muted/20 dark:bg-muted/10 rounded-lg p-6 sm:p-8 border border-dashed border-border animate-in fade-in duration-300">
            <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
            {searchTerm ? (
              <p className="text-sm sm:text-base">Nenhuma nota encontrada com o termo "{searchTerm}".</p>
            ) : (
              <>
                <p className="text-sm sm:text-base">Você ainda não tem nenhuma anotação.</p>
                {!creating && (
                  <Button 
                    onClick={() => setCreating(true)} 
                    variant="outline" 
                    className="mt-4 w-full sm:w-auto"
                  >
                    <Plus className="mr-2" />
                    Criar sua primeira nota
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 animate-in fade-in duration-300">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                clients={clients}
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
