
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import type { Note } from '@/hooks/useNotes';
import type { Client } from '@/hooks/useClients';
import { NoteCard } from './NoteCard';

interface NoteListRowProps {
  note: Note;
  clients: Client[];
  onUpdate: (id: string, title: string, content: string, clientId: string | null) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const NoteListRow = ({ note, clients, onUpdate, onDelete }: NoteListRowProps) => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowDetail(true)}
        onKeyDown={(e) => { if (e.key === 'Enter') setShowDetail(true); }}
        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
          <div className="min-w-0">
            <p className="font-medium truncate">{note.title}</p>
            <p className="text-xs text-muted-foreground truncate">{note.content}</p>
          </div>
          <div className="min-w-0">
            {note.client_name && (
              <Badge variant="outline" className="gap-1 text-[11px] font-normal">
                <User className="w-3 h-3" />
                <span className="truncate">{note.client_name}</span>
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground text-right sm:text-left">
            {formatDate(note.updated_at || note.created_at)}
          </div>
        </div>
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg p-0 pt-6">
          <NoteCard
            note={note}
            clients={clients}
            onUpdate={onUpdate}
            onDelete={async (id) => { setShowDetail(false); await onDelete(id); }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
