import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pin, PinOff, Plus, Trash2, StickyNote } from 'lucide-react';
import { useAdminFinanceNotes } from '@/hooks/admin/useAdminFinanceNotes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export const AdminFinanceNotes: React.FC = () => {
  const { notes, loading, createNote, updateNote, deleteNote } = useAdminFinanceNotes();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const ok = await createNote({ title, content });
      if (ok) {
        setOpen(false);
        setTitle('');
        setContent('');
      }
    } finally {
      setSaving(false);
    }
  };

  const togglePin = (id: string, note: { title: string; content: string | null; pinned: boolean }) => {
    updateNote(id, { title: note.title, content: note.content, pinned: !note.pinned });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <StickyNote className="w-4 h-4" />
          Anotações
        </CardTitle>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma anotação ainda.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border rounded-lg p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {note.pinned && <Badge variant="secondary" className="shrink-0 text-[10px]">Fixado</Badge>}
                  <h4 className="font-medium text-sm truncate">{note.title}</h4>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => togglePin(note.id, note)}
                  >
                    {note.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:text-destructive"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              {note.content && (
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{note.content}</p>
              )}
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova anotação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conteúdo..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !title.trim()}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
