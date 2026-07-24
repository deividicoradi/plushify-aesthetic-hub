import React from 'react';
import { DollarSign, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCommissions } from '@/hooks/team/useCommissions';
import { useStaffMode } from '@/contexts/StaffModeContext';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

const statusLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  paid: { label: 'Paga', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'outline' },
};

interface CommissionsPanelProps {
  // Quando informado, mostra só as comissões desse profissional (Modo
  // Funcionário). Quando omitido, mostra as comissões de todos (dono).
  teamMemberId?: string;
  // Mapa id -> nome, usado só na visão do dono para identificar o profissional.
  memberNames?: Record<string, string>;
  // Só o dono pode marcar uma comissão como paga.
  canManage?: boolean;
}

export const CommissionsPanel: React.FC<CommissionsPanelProps> = ({ teamMemberId, memberNames, canManage = false }) => {
  const { commissions, loading, totals, markAsPaid } = useCommissions(teamMemberId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">A receber</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-lg sm:text-2xl font-bold">{formatCurrency(totals.pending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Já pago</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-lg sm:text-2xl font-bold">{formatCurrency(totals.paid)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            Comissões
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {commissions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Nenhuma comissão ainda</h3>
              <p className="text-sm text-muted-foreground">
                Comissões aparecem aqui automaticamente quando um agendamento é concluído.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {commissions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                >
                  <div className="min-w-0">
                    {memberNames && (
                      <p className="font-medium truncate">{memberNames[c.team_member_id] || 'Profissional'}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(c.created_at)} · {formatCurrency(c.base_amount)} × {c.commission_percent}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold">{formatCurrency(c.commission_amount)}</span>
                    <Badge variant={statusLabel[c.status]?.variant || 'outline'}>
                      {statusLabel[c.status]?.label || c.status}
                    </Badge>
                    {canManage && c.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => markAsPaid(c.id)}>
                        Marcar como paga
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Painel exibido no Modo Funcionário — só as comissões do profissional ativo,
// respeitando a permissão view_commissions do cargo.
export const StaffCommissionsPanel: React.FC = () => {
  const { activeMember, can } = useStaffMode();

  if (!activeMember) return null;

  if (!can('view_commissions')) {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
        <Lock className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          O cargo deste funcionário não tem acesso a Comissões no Modo Funcionário.
        </AlertDescription>
      </Alert>
    );
  }

  return <CommissionsPanel teamMemberId={activeMember.id} />;
};
