import React from 'react';
import { Gift, Copy, Users, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useReferrals } from '@/hooks/useReferrals';
import { toast } from '@/hooks/use-toast';

export const ReferralPanel = () => {
  const { referralLink, referrals, rewardedCount, pendingCount, loading } = useReferrals();

  const handleCopy = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Link copiado',
      description: 'Envie esse link para amigos e ganhe 30 dias grátis quando eles assinarem um plano pago.',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Indique e Ganhe
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Compartilhe seu link. Quando a pessoa indicada assinar um plano pago (Professional ou Premium),
            vocês dois ganham <strong>30 dias grátis</strong> de assinatura, automaticamente.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button onClick={handleCopy} className="gap-2 shrink-0">
              <Copy className="w-4 h-4" />
              Copiar link
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5" /> Aguardando
              </div>
              <p className="text-2xl font-bold mt-1">{pendingCount}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Recompensadas
              </div>
              <p className="text-2xl font-bold mt-1 text-emerald-600">{rewardedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4" />
            Suas indicações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Você ainda não indicou ninguém. Compartilhe seu link para começar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.referred_email || 'E-mail não disponível'}</p>
                    <p className="text-xs text-muted-foreground">
                      Indicado em {new Date(r.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={r.status === 'rewarded' ? 'default' : 'outline'} className="shrink-0">
                    {r.status === 'rewarded' ? 'Recompensada' : 'Aguardando assinatura'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
