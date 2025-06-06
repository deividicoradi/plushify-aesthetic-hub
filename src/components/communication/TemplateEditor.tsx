
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MessageTemplate {
  id: number;
  title: string;
  description: string;
  type: string;
  content?: string;
}

interface TemplateEditorProps {
  template: MessageTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: MessageTemplate) => void;
}

const TemplateEditor = ({ template, isOpen, onClose, onSave }: TemplateEditorProps) => {
  const [editedTemplate, setEditedTemplate] = useState<MessageTemplate>({
    id: 0,
    title: '',
    description: '',
    type: 'Manual',
    content: ''
  });

  React.useEffect(() => {
    if (template) {
      setEditedTemplate({
        ...template,
        content: template.content || getDefaultContent(template.title)
      });
    }
  }, [template]);

  const getDefaultContent = (title: string) => {
    switch (title) {
      case 'Confirmação de Agendamento':
        return 'Olá {nome}! Seu agendamento foi confirmado para {data} às {hora}. Local: {endereco}. Em caso de dúvidas, entre em contato conosco.';
      case 'Lembrete 24h':
        return 'Oi {nome}! Lembrando que você tem um agendamento amanhã ({data}) às {hora}. Nos vemos lá! 😊';
      case 'Promoção Mensal':
        return '🎉 Oferta especial para você, {nome}! Aproveite nossa promoção do mês com desconto especial. Válida até {data_limite}.';
      default:
        return 'Olá {nome}! Esta é uma mensagem personalizada.';
    }
  };

  const handleSave = () => {
    if (!editedTemplate.title || !editedTemplate.content) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    onSave(editedTemplate);
    toast.success("Template salvo com sucesso!");
    onClose();
  };

  const variables = ['{nome}', '{data}', '{hora}', '{endereco}', '{telefone}', '{servico}', '{data_limite}'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Template de Mensagem</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Título</label>
            <Input
              value={editedTemplate.title}
              onChange={(e) => setEditedTemplate({...editedTemplate, title: e.target.value})}
              placeholder="Nome do template"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Descrição</label>
            <Input
              value={editedTemplate.description}
              onChange={(e) => setEditedTemplate({...editedTemplate, description: e.target.value})}
              placeholder="Descrição do template"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <Select 
              value={editedTemplate.type} 
              onValueChange={(value) => setEditedTemplate({...editedTemplate, type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Automático">Automático</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Conteúdo da Mensagem</label>
            <Textarea
              value={editedTemplate.content}
              onChange={(e) => setEditedTemplate({...editedTemplate, content: e.target.value})}
              placeholder="Digite o conteúdo da mensagem..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Variáveis Disponíveis</label>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <Badge 
                  key={variable} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => {
                    const newContent = editedTemplate.content + variable;
                    setEditedTemplate({...editedTemplate, content: newContent});
                  }}
                >
                  {variable}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clique em uma variável para adicioná-la ao conteúdo
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateEditor;
