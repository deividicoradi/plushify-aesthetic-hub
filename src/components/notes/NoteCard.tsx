
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Save, X, Loader2, User } from "lucide-react";
import type { Note } from '@/hooks/useNotes';
import type { Client } from '@/hooks/useClients';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/sonner';

interface NoteCardProps {
  note: Note;
  clients: Client[];
  onUpdate: (id: string, title: string, content: string, clientId: string | null) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
}

export const NoteCard = ({ note, clients, onUpdate, onDelete }: NoteCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [editClientId, setEditClientId] = useState<string | null>(note.client_id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleUpdate = async () => {
    if (!editTitle.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onUpdate(note.id, editTitle, editContent, editClientId);
      if (success) {
        setEditing(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete(note.id);
      setShowDeleteDialog(false);
    } finally {
      setIsSubmitting(false);
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
    <>
      <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-2 p-4 sm:p-6">
          {editing ? (
            <Input
              id={`edit-note-title-${note.id}`}
              name="edit-note-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-bold focus:ring-2 focus:ring-plush-500 text-sm sm:text-base"
              placeholder="Título da nota"
              disabled={isSubmitting}
            />
          ) : (
            <CardTitle className="break-words text-base sm:text-lg">{note.title}</CardTitle>
          )}
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            {note.updated_at ? `Atualizado: ${formatDate(note.updated_at)}` : formatDate(note.created_at)}
          </p>
          {editing ? (
            <div className="mt-2">
              <Select
                value={editClientId ?? 'none'}
                onValueChange={(v) => setEditClientId(v === 'none' ? null : v)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Vincular a um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem cliente vinculado</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : note.client_name ? (
            <Badge variant="outline" className="mt-2 gap-1 text-[11px] font-normal">
              <User className="w-3 h-3" />
              {note.client_name}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="flex-grow pb-2 p-4 sm:p-6 pt-0 sm:pt-0">
          {editing ? (
            <Textarea
              id={`edit-note-content-${note.id}`}
              name="edit-note-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={5}
              className="resize-none h-full min-h-[100px] focus:ring-2 focus:ring-plush-500 text-sm sm:text-base"
              placeholder="Conteúdo da nota..."
              disabled={isSubmitting}
            />
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{note.content}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-2 p-4 sm:p-6">
          {editing ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setEditing(false);
                  setEditTitle(note.title);
                  setEditContent(note.content);
                  setEditClientId(note.client_id);
                }}
                disabled={isSubmitting}
                className="transition-colors w-full sm:w-auto"
              >
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                size="sm"
                className="bg-plush-600 hover:bg-plush-700 transition-colors w-full sm:w-auto"
                onClick={handleUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1 h-4 w-4" />
                )}
                Salvar
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditing(true)}
                className="transition-colors hover:bg-plush-50 w-full sm:w-auto"
              >
                <Edit className="mr-1 h-4 w-4" />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
                className="transition-colors w-full sm:w-auto"
              >
                <Trash className="mr-1 h-4 w-4" />
                Excluir
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Diálogo de confirmação para exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Excluir Nota</DialogTitle>
            <DialogDescription className="text-sm">
              Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash className="mr-2 h-4 w-4" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
