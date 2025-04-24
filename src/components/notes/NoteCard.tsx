
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash, Save, X } from "lucide-react";
import type { Note } from '@/hooks/useNotes';

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, title: string, content: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
}

export const NoteCard = ({ note, onUpdate, onDelete }: NoteCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleUpdate = async () => {
    const success = await onUpdate(note.id, editTitle, editContent);
    if (success) {
      setEditing(false);
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
    <Card className="flex flex-col">
      <CardHeader>
        {editing ? (
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
        {editing ? (
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
            >
              <X className="mr-1 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              size="sm"
              className="bg-plush-600 hover:bg-plush-700"
              onClick={handleUpdate}
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
              onClick={() => setEditing(true)}
            >
              <Edit className="mr-1 h-4 w-4" />
              Editar
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete(note.id)}
            >
              <Trash className="mr-1 h-4 w-4" />
              Excluir
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};
