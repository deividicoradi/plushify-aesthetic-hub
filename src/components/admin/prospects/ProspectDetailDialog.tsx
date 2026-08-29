import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isSafeUrl } from '@/lib/safeUrl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import {
  Prospect,
  ProspectInteraction,
  ContactChannel,
  ProspectStatus,
  CHANNEL_LABELS,
  STATUS_LABELS,
  STATUS_CLASS,
} from './types';

interface ProspectDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (prospect: Prospect) => void;
  prospect: Prospect | null;
  onChanged: () => void;
}

export const ProspectDetailDialog: React.FC<ProspectDetailDialogProps> = ({ open, onOpenChange, prospect, onChanged, onEdit }) => {
  const [interactions, setInteractions] = useState<ProspectInteraction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [newChannel, setNewChannel] = useState<ContactChannel>('whatsapp');
  const [newNote, setNewNote] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [showLossForm, setShowLossForm] = useState(false);
  const [purchaseValue, setPurchaseValue] = useState('');
  const [convertedEmail, setConvertedEmail] = useState('');
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadInteractions = async () => {
    if (!prospect) return;
    setLoadingInteractions(true);
    const { data, error } = await supabase.rpc('admin_get_prospect_interactions', { p_prospect_id: prospect.id });
    if (error) {
      toast.error('Erro ao carregar histórico: ' + error.message);
    } else {
      setInteractions((data || []) as ProspectInteraction[]);
    }
    setLoadingInteractions(false);
  };

  useEffect(() => {
    if (open && prospect) {
      loadInteractions();
      setShowLossForm(false);
      setShowConvertForm(false);
      setLossReason('');
      setPurchaseValue('');
      setConvertedEmail('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prospect?.id]);

  if (!prospect) return null;

  const handleAddInteraction = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    const { error } = await supabase.rpc('admin_add_prospect_interaction', {
      p_prospect_id: prospect.id,
      p_channel: newChannel,
      p_note: newNote.trim(),
    });
    setSaving(false);
    if (error) {
      toast.error('Erro ao registrar contato: ' + error.message);
    } else {
      setNewNote('');
      loadInteractions();
      onChanged();
      toast.success('Contato registrado!');
    }
  };

  const handleStatusChange = async (status: ProspectStatus) => {
    if (status === 'perdido') {
      setShowLossForm(true);
      return;
    }
    if (status === 'convertido') {
      setShowConvertForm(true);
      return;
    }
    const { error } = await supabase.rpc('admin_set_prospect_status', { p_id: prospect.id, p_status: status });
    if (error) {
      toast.error('Erro ao atualizar status: ' + error.message);
    } else {
      onChanged();
    }
  };

  const handleConfirmLoss = async () => {
    if (!lossReason.trim()) return;
    setSaving(true);
    const { error } = await supabase.rpc('admin_set_prospect_status', {
      p_id: prospect.id,
      p_status: 'perdido',
      p_loss_reason: lossReason.trim(),
    });
    setSaving(false);
    if (error) {
      toast.error('Erro ao marcar como perdido: ' + error.message);
      return;
    }
    setShowLossForm(false);
    onChanged();
    onOpenChange(false);
  };

  const handleConfirmConvert = async () => {
    setSaving(true);
    const { error } = await supabase.rpc('admin_convert_prospect', {
      p_id: prospect.id,
      p_converted_email: convertedEmail.trim() || null,
      p_first_payment_value: purchaseValue ? Number(purchaseValue) : null,
    });
    setSaving(false);
    if (error) {
      toast.error('Erro ao converter prospect: ' + error.message);
      return;
    }
    setShowConvertForm(false);
    onChanged();
    onOpenChange(false);
    toast.success('Prospect convertido!');
  };

  const isFinalized = prospect.status === 'convertido' || prospect.status === 'perdido';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {prospect.name}
            <Badge className={STATUS_CLASS[prospect.status]}>{STATUS_LABELS[prospect.status]}</Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-auto mr-6"
              onClick={() => { onOpenChange(false); onEdit(prospect); }}
              aria-label="Editar prospect"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Telefone:</span> {prospect.phone || '—'}</div>
            <div><span className="text-muted-foreground">E-mail:</span> {prospect.email || '—'}</div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Rede social:</span>{' '}
              {prospect.social_link && isSafeUrl(prospect.social_link) ? (
                <a href={prospect.social_link} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 break-all">
                  {prospect.social_link}
                </a>
              ) : (
                prospect.social_link || '—'
              )}
            </div>
            <div><span className="text-muted-foreground">Plano de interesse:</span> {prospect.plan_interest || '—'}</div>
            <div><span className="text-muted-foreground">Valor estimado:</span> {prospect.estimated_value != null ? `R$ ${prospect.estimated_value.toFixed(2)}` : '—'}</div>
            <div><span className="text-muted-foreground">Prospectando:</span> {prospect.prospector_name || '—'}</div>
            {prospect.status === 'perdido' && (
              <div className="col-span-2"><span className="text-muted-foreground">Motivo da perda:</span> {prospect.loss_reason || '—'}</div>
            )}
            {prospect.status === 'convertido' && (
              <>
                <div className="col-span-2"><span className="text-muted-foreground">Valor da primeira cobrança:</span> {prospect.first_payment_value != null ? `R$ ${prospect.first_payment_value.toFixed(2)}` : '—'}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Conta vinculada:</span> {prospect.converted_user_email || 'não vinculada'}</div>
              </>
            )}
            {prospect.notes && <div className="col-span-2"><span className="text-muted-foreground">Observações:</span> {prospect.notes}</div>}
          </div>

          {!isFinalized && (
            <div className="space-y-2">
              <Label>Alterar status</Label>
              <Select value={prospect.status} onValueChange={(v) => handleStatusChange(v as ProspectStatus)}>
                <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showLossForm && (
            <div className="space-y-2 border border-destructive/30 rounded-lg p-3">
              <Label htmlFor="loss-reason">Motivo da perda</Label>
              <Textarea id="loss-reason" value={lossReason} onChange={(e) => setLossReason(e.target.value)} placeholder="Ex: preço, já tem outro sistema, não respondeu..." rows={2} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowLossForm(false)}>Cancelar</Button>
                <Button size="sm" variant="destructive" disabled={!lossReason.trim() || saving} onClick={handleConfirmLoss}>Confirmar perda</Button>
              </div>
            </div>
          )}

          {showConvertForm && (
            <div className="space-y-2 border border-emerald-600/30 rounded-lg p-3">
              <Label htmlFor="converted-email">E-mail da conta assinante (opcional)</Label>
              <Input id="converted-email" type="email" value={convertedEmail} onChange={(e) => setConvertedEmail(e.target.value)} placeholder="email@exemplo.com" />
              <p className="text-xs text-muted-foreground">Se o dono já criou conta no Plushify, informe o e-mail pra vincular este prospect ao cliente real.</p>
              <Label htmlFor="purchase-value">Valor da primeira cobrança (opcional)</Label>
              <Input id="purchase-value" type="number" min="0" step="0.01" value={purchaseValue} onChange={(e) => setPurchaseValue(e.target.value)} placeholder="0,00" />
              <p className="text-xs text-muted-foreground">Marca este prospect como convertido em assinante.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowConvertForm(false)}>Cancelar</Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving} onClick={handleConfirmConvert}>Confirmar conversão</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Histórico de contatos</Label>
            {loadingInteractions ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : interactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum contato registrado ainda.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {interactions.map((i) => (
                  <div key={i.id} className="text-sm border border-border/50 rounded-md p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{CHANNEL_LABELS[i.channel]}</span>
                      <span className="text-xs text-muted-foreground">{new Date(i.occurred_at).toLocaleString('pt-BR')}</span>
                    </div>
                    {i.note && <p className="text-muted-foreground mt-1">{i.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isFinalized && (
            <div className="space-y-2 border-t border-border/50 pt-4">
              <Label>Registrar novo contato</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={newChannel} onValueChange={(v) => setNewChannel(v as ContactChannel)}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="O que foi conversado?" rows={2} className="flex-1" />
              </div>
              <div className="flex justify-end">
                <Button size="sm" disabled={!newNote.trim() || saving} onClick={handleAddInteraction}>Registrar contato</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
