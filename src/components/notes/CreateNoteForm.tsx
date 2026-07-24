
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from '@/components/ui/sonner';
import { Client } from '@/hooks/useClients';

interface CreateNoteFormProps {
  onSubmit: (title: string, content: string, clientId: string | null) => Promise<void>;
  onCancel: () => void;
  clients: Client[];
}

export const CreateNoteForm = ({ onSubmit, onCancel, clients }: CreateNoteFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(title, content, clientId);
      setTitle('');
      setContent('');
      setClientId(null);
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 sm:mb-8 shadow-md animate-in fade-in duration-300">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
        <CardTitle className="text-base sm:text-lg">Nova Nota</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
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
        <div className="space-y-2">
          <Select
            value={clientId ?? 'none'}
            onValueChange={(v) => setClientId(v === 'none' ? null : v)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
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
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 p-4 sm:p-6 pt-2 sm:pt-2">
        <Button 
          onClick={handleSubmit}
          className="bg-plush-600 hover:bg-plush-700 transition-colors w-full sm:w-auto order-2 sm:order-1"
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
          className="transition-colors w-full sm:w-auto order-1 sm:order-2"
          disabled={isSubmitting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  );
};
