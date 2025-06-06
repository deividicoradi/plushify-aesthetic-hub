
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, MessageSquare } from 'lucide-react';

interface MessageTemplate {
  id: number;
  title: string;
  description: string;
  type: string;
  content?: string;
}

interface MessageTemplateCardProps {
  template: MessageTemplate;
  onEdit: (template: MessageTemplate) => void;
  onUse: (template: MessageTemplate) => void;
}

const MessageTemplateCard = ({ template, onEdit, onUse }: MessageTemplateCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          {template.title}
        </CardTitle>
        <Badge variant="outline" className="w-fit">
          {template.type}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onEdit(template)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onUse(template)}
          >
            Usar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageTemplateCard;
