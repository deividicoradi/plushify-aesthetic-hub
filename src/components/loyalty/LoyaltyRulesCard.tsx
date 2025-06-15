
import React from 'react';
import { Gift, DollarSign, Calendar, Award } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const LoyaltyRulesCard: React.FC = () => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Como Funciona
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-green-100/80 dark:bg-green-900/80 rounded">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-sm">1 Real = 1 Ponto</p>
              <p className="text-xs text-muted-foreground">A cada R$ 1,00 gasto, o cliente ganha 1 ponto</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100/80 dark:bg-blue-900/80 rounded">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Automático</p>
              <p className="text-xs text-muted-foreground">Pontos creditados quando o agendamento é concluído</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1 bg-purple-100/80 dark:bg-purple-900/80 rounded">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Tiers Automáticos</p>
              <p className="text-xs text-muted-foreground">Bronze, Prata, Ouro e Diamante</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50 space-y-2">
          <h4 className="font-medium text-sm">Níveis de Fidelidade:</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <Badge variant="secondary" className="text-xs bg-secondary/80">Bronze</Badge>
              <span className="text-muted-foreground">R$ 0+</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <Badge className="bg-gray-400 text-white text-xs">Prata</Badge>
              <span className="text-muted-foreground">R$ 500+</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <Badge className="bg-yellow-500 text-white text-xs">Ouro</Badge>
              <span className="text-muted-foreground">R$ 1.000+</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <Badge className="bg-blue-500 text-white text-xs">Diamante</Badge>
              <span className="text-muted-foreground">R$ 2.000+</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
