
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash, Save, X, Loader2 } from "lucide-react";
import type { Note } from '@/hooks/useNotes';
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
  onUpdate: (id: string, title: string, content: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
}

export const NoteCard = ({ note, onUpdate, onDelete }: NoteCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleUpdate = async () => {
    if (!editTitle.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onUpdate(note.id, editTitle, editContent);
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
        <CardHeader className="pb-2">
          {editing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-bold focus:ring-2 focus:ring-plush-500"
              placeholder="Título da nota"
              disabled={isSubmitting}
            />
          ) : (
            <CardTitle className="break-words">{note.title}</CardTitle>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {note.updated_at ? `Atualizado: ${formatDate(note.updated_at)}` : formatDate(note.created_at)}
          </p>
        </CardHeader>
        <CardContent className="flex-grow pb-2">
          {editing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={5}
              className="resize-none h-full min-h-[100px] focus:ring-2 focus:ring-plush-500"
              placeholder="Conteúdo da nota..."
              disabled={isSubmitting}
            />
          ) : (
            <p className="whitespace-pre-wrap break-words">{note.content}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-2">
          {editing ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setEditing(false);
                  setEditTitle(note.title);
                  setEditContent(note.content);
                }}
                disabled={isSubmitting}
                className="transition-colors"
              >
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                size="sm"
                className="bg-plush-600 hover:bg-plush-700 transition-colors"
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
                className="transition-colors hover:bg-plush-50"
              >
                <Edit className="mr-1 h-4 w-4" />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
                className="transition-colors"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Nota</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
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
