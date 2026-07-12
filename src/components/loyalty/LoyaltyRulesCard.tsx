
import React from 'react';
import { Gift, DollarSign, Calendar, Award } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLoyaltyConfig } from '@/hooks/loyalty/useLoyaltyConfig';

const iconFor = (icon?: string) => {
  switch (icon) {
    case 'dollar': return <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />;
    case 'calendar': return <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />;
    case 'award': return <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />;
    default: return <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />;
  }
};

export const LoyaltyRulesCard: React.FC = () => {
  const { settings, tiers } = useLoyaltyConfig();
  const blocks = (settings?.how_it_works ?? []).filter((b: any) => b.active !== false);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Como Funciona
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-2 sm:space-y-3">
          {blocks.map((b: any) => (
            <div key={b.id} className="flex items-start gap-2 sm:gap-3">
              <div className="p-1 bg-primary/10 rounded">{iconFor(b.icon)}</div>
              <div>
                <p className="font-medium text-xs sm:text-sm">{b.title}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{b.description}</p>
              </div>
            </div>
          ))}
        </div>

        {tiers.length > 0 && (
          <div className="pt-2 sm:pt-3 border-t border-border/50 space-y-2">
            <h4 className="font-medium text-xs sm:text-sm">Níveis de Fidelidade:</h4>
            <div className="space-y-1">
              {tiers.filter(t => t.active).map(t => (
                <div key={t.id} className="flex items-center justify-between text-[11px] sm:text-xs">
                  <Badge className="text-white text-[10px] sm:text-xs" style={{ backgroundColor: t.color }}>{t.name}</Badge>
                  <span className="text-muted-foreground">R$ {Number(t.min_spent).toLocaleString('pt-BR')}+</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
