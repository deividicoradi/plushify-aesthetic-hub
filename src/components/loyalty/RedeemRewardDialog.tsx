import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Search } from 'lucide-react';
import { LoyaltyClient } from '@/hooks/useLoyalty';
import { Reward } from '@/hooks/useRewards';
import { useRedeemReward } from '@/hooks/loyalty/useRedeemReward';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
  clients: LoyaltyClient[];
  onRedeemed?: () => void;
}

export const RedeemRewardDialog: React.FC<Props> = ({ open, onOpenChange, reward, clients, onRedeemed }) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { redeem, redeeming } = useRedeemReward();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(c => c.name.toLowerCase().includes(term));
  }, [clients, search]);

  const selectedClient = clients.find(c => c.id === selectedId) || null;
  const hasEnoughPoints = !!selectedClient && !!reward && selectedClient.totalPoints >= reward.pointsCost;

  const handleClose = (o: boolean) => {
    if (!o) {
      setSearch('');
      setSelectedId(null);
    }
    onOpenChange(o);
  };

  const handleConfirm = async () => {
    if (!reward || !selectedClient) return;
    const ok = await redeem(selectedClient.id, reward.id);
    if (ok) {
      handleClose(false);
      onRedeemed?.();
    }
  };

  if (!reward) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Resgatar "{reward.title}"</DialogTitle>
          <DialogDescription>
            Selecione o cliente que está resgatando esta recompensa por {reward.pointsCost} pontos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedId(null); }}
              placeholder="Buscar cliente..."
              className="pl-8"
            />
          </div>

          <ScrollArea className="h-64 rounded-md border">
            <div className="p-1.5 space-y-1">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Nenhum cliente encontrado.</p>
              ) : (
                filtered.map((c) => {
                  const enough = c.totalPoints >= reward.pointsCost;
                  const isSelected = selectedId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={!enough}
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm text-left transition-colors ${
                        isSelected ? 'bg-primary/10 border border-primary/40' : 'hover:bg-muted/50 border border-transparent'
                      } ${!enough ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="flex items-center gap-1 text-xs font-medium shrink-0 ml-2">
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                        {c.totalPoints} pts
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {selectedClient && !hasEnoughPoints && (
            <p className="text-xs text-destructive">
              {selectedClient.name} não tem pontos suficientes para essa recompensa.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!hasEnoughPoints || redeeming}>
            {redeeming ? 'Resgatando...' : 'Confirmar resgate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
