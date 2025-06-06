
import React from 'react';
import { HelpCircle, ExternalLink, Book, Video, MessageCircle, ArrowRight } from 'lucide-react';
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
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Video,
      title: "Tutoriais",
      description: "Vídeos explicativos",
      action: () => navigate('/help'),
      color: "from-green-500 to-green-600"
    },
    {
      icon: MessageCircle,
      title: "Suporte",
      description: "Fale conosco",
      action: () => window.open('mailto:suporte@plushify.com'),
      color: "from-purple-500 to-purple-600"
    },
  ];

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-card dark:to-card/50">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800/50 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <span className="text-orange-900 dark:text-orange-100">Ajuda Rápida</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {helpItems.map((item, index) => (
          <div
            key={index}
            className="group p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 hover:from-gray-100 hover:to-gray-200/50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200 cursor-pointer border border-border/30 hover:border-border/60"
            onClick={item.action}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>
        ))}
        
        <Button
          className="w-full mt-6 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white border-0 shadow-md"
          onClick={() => navigate('/help')}
        >
          <Book className="w-4 h-4 mr-2" />
          Ver toda a ajuda
        </Button>
      </CardContent>
    </Card>
  );
};
