
import React from 'react';
import { HelpCircle, ExternalLink, Book, Video, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const QuickHelp = () => {
  const navigate = useNavigate();

  const helpItems = [
    {
      icon: Book,
      title: "Guia de Introdução",
      description: "Aprenda o básico do Plushify",
      action: () => navigate('/help'),
    },
    {
      icon: Video,
      title: "Tutoriais",
      description: "Vídeos explicativos",
      action: () => navigate('/help'),
    },
    {
      icon: MessageCircle,
      title: "Suporte",
      description: "Fale conosco",
      action: () => window.open('mailto:suporte@plushify.com'),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Ajuda Rápida
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {helpItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={item.action}
          >
            <item.icon className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </div>
        ))}
        
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => navigate('/help')}
        >
          Ver toda a ajuda
        </Button>
      </CardContent>
    </Card>
  );
};
