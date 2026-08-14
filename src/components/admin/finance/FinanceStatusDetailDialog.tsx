import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Inbox } from 'lucide-react';
import { useAdminFinance, CATEGORY_LABELS, FinanceStatus } from '@/hooks/admin/useAdminFinance';

interface FinanceStatusDetailDialogProps {
  status: FinanceStatus | null;
  title: string;
  from: string;
  to: string;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const FinanceStatusDetailDialog: React.FC<FinanceStatusDetailDialogProps> = ({
  status,
  title,
  from,
  to,
  onOpenChange,
}) => {
  const { entries, loading } = useAdminFinance({
    status: status ?? undefined,
    from,
    to,
    enabled: status !== null,
  });

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Dialog open={status !== null} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 pr-6">
            <span>{title}</span>
            <span className="text-base font-semibold text-primary">{formatCurrency(total)}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Inbox className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">Nenhum lançamento neste período.</p>
            </div>
          ) : (
            <div className="space-y-2 pr-3">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-3 border rounded-lg p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{entry.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {CATEGORY_LABELS[entry.category]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(`${entry.due_date}T00:00:00`).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-sm shrink-0">{formatCurrency(entry.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
