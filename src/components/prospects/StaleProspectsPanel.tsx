import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { StaleProspect, useProspects } from '@/hooks/useProspects';

export const StaleProspectsPanel: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  const { fetchStaleProspects } = useProspects();
  const [items, setItems] = useState<StaleProspect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchStaleProspects();
      setItems(data);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground py-6 text-center">Verificando follow-ups...</p>;
  }

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Nenhum prospect parado há mais de 90 dias. Tudo em dia!
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Prospects sem contato há 90+ dias (atenção) ou 180+ dias (crítico) que ainda não converteram nem foram marcados como perdidos.
      </p>
      {items.map((item) => (
        <Card
          key={item.id}
          role="button"
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-accent/50"
          onClick={() => onSelect(item.id)}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${item.urgency === 'critico' ? 'text-destructive' : 'text-amber-500'}`} />
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.phone || 'Sem telefone'} · {item.days_since_contact} dias sem contato</p>
            </div>
          </div>
          <Badge className={item.urgency === 'critico' ? 'bg-destructive/15 text-destructive' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}>
            {item.urgency === 'critico' ? 'Crítico' : 'Atenção'}
          </Badge>
        </Card>
      ))}
    </div>
  );
};
