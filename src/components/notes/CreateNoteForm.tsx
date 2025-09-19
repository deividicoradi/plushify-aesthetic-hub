
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from '@/components/ui/sonner';

interface CreateNoteFormProps {
  onSubmit: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
}

export const CreateNoteForm = ({ onSubmit, onCancel }: CreateNoteFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(title, content);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 shadow-md animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle>Nova Nota</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            id="create-note-title"
            name="note-title"
            placeholder="Título da nota"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="focus:ring-2 focus:ring-plush-500"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Textarea
            id="create-note-content"
            name="note-content"
            placeholder="Conteúdo da nota..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="resize-none focus:ring-2 focus:ring-plush-500"
            disabled={isSubmitting}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit}
          className="bg-plush-600 hover:bg-plush-700 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Salvar Nota
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="ml-2 transition-colors"
          disabled={isSubmitting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  );
};
