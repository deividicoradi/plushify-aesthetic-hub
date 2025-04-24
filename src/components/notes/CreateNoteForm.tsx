
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

interface CreateNoteFormProps {
  onSubmit: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
}

export const CreateNoteForm = ({ onSubmit, onCancel }: CreateNoteFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    await onSubmit(title, content);
    setTitle('');
    setContent('');
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Nova Nota</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Título da nota"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Textarea
            placeholder="Conteúdo da nota..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit}
          className="bg-plush-600 hover:bg-plush-700"
        >
          <Plus className="mr-2" />
          Salvar Nota
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="ml-2"
        >
          <X className="mr-2" />
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  );
};
