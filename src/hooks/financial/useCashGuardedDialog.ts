import { useState } from 'react';
import { useCashStatus } from '@/components/financial/CashStatusProvider';
import { toast } from '@/hooks/use-toast';

/**
 * Padrão repetido em Pagamentos/Despesas/Parcelamentos: bloquear ANTES de
 * abrir o formulário de um lançamento NOVO se o caixa do dia estiver
 * fechado (editar um lançamento já existente continua permitido — a regra
 * vale pra data do registro, não pra data de hoje). Sem isso o usuário
 * preenchia tudo e só descobria que o caixa estava fechado ao salvar,
 * perdendo o preenchimento à toa.
 */
export function useCashGuardedDialog<T = any>(blockedMessage: string) {
  const { isOpen: isCashOpen } = useCashStatus();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const openDialog = (item?: T | null) => {
    if (!item && !isCashOpen) {
      toast({
        title: 'Caixa fechado',
        description: blockedMessage,
        variant: 'destructive',
      });
      return;
    }
    setEditing(item ?? null);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  return { isCashOpen, open, editing, openDialog, closeDialog, setOpen };
}
