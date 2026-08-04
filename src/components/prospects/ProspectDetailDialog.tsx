import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Prospect,
  ProspectInteraction,
  ContactChannel,
  ProspectStatus,
  useProspects,
} from '@/hooks/useProspects';

const CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  telefone: 'Telefone',
  presencial: 'Presencial',
  email: 'E-mail',
  outro: 'Outro',
};

const STATUS_LABELS: Record<ProspectStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  interessado: 'Interessado',
  negociando: 'Negociando',
  convertido: 'Convertido',
  perdido: 'Perdido',
};

const STATUS_CLASS: Record<ProspectStatus, string> = {
  novo: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  contatado: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  interessado: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  negociando: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  convertido: 'bg-emerald-600 text-white',
  perdido: 'bg-destructive/15 text-destructive',
};

interface ProspectDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect: Prospect | null;
  onChanged: () => void;
}

export const ProspectDetailDialog: React.FC<ProspectDetailDialogProps> = ({ open, onOpenChange, prospect, onChanged }) => {
  const { fetchInteractions, addInteraction, updateProspect, markLost, convertToClient } = useProspects();
  const [interactions, setInteractions] = useState<ProspectInteraction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [newChannel, setNewChannel] = useState<ContactChannel>('whatsapp');
  const [newNote, setNewNote] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [showLossForm, setShowLossForm] = useState(false);
  const [purchaseValue, setPurchaseValue] = useState('');
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadInteractions = async () => {
    if (!prospect) return;
    setLoadingInteractions(true);
    const data = await fetchInteractions(prospect.id);
    setInteractions(data);
    setLoadingInteractions(false);
  };

  useEffect(() => {
    if (open && prospect) {
      loadInteractions();
      setShowLossForm(false);
      setShowConvertForm(false);
      setLossReason('');
      setPurchaseValue('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prospect?.id]);

  if (!prospect) return null;

  const handleAddInteraction = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    const result = await addInteraction(prospect.id, newChannel, newNote.trim());
    setSaving(false);
    if (result) {
      setNewNote('');
      loadInteractions();
      onChanged();
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
    await updateProspect(prospect.id, { status });
    onChanged();
  };

  const handleConfirmLoss = async () => {
    if (!lossReason.trim()) return;
    setSaving(true);
    await markLost(prospect.id, lossReason.trim());
    setSaving(false);
    setShowLossForm(false);
    onChanged();
    onOpenChange(false);
  };

  const handleConfirmConvert = async () => {
    setSaving(true);
    const result = await convertToClient(prospect.id, purchaseValue ? Number(purchaseValue) : undefined);
    setSaving(false);
    if (result) {
      setShowConvertForm(false);
      onChanged();
      onOpenChange(false);
    }
  };

  const isFinalized = prospect.status === 'convertido' || prospect.status === 'perdido';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {prospect.name}
            <Badge className={STATUS_CLASS[prospect.status]}>{STATUS_LABELS[prospect.status]}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Telefone:</span> {prospect.phone || '—'}</div>
            <div><span className="text-muted-foreground">E-mail:</span> {prospect.email || '—'}</div>
            <div><span className="text-muted-foreground">Serviço de interesse:</span> {prospect.service_interest || '—'}</div>
            <div><span className="text-muted-foreground">Valor estimado:</span> {prospect.estimated_value != null ? `R$ ${prospect.estimated_value.toFixed(2)}` : '—'}</div>
            {prospect.status === 'perdido' && (
              <div className="col-span-2"><span className="text-muted-foreground">Motivo da perda:</span> {prospect.loss_reason || '—'}</div>
            )}
            {prospect.status === 'convertido' && (
              <div className="col-span-2"><span className="text-muted-foreground">Valor da primeira compra:</span> {prospect.first_purchase_value != null ? `R$ ${prospect.first_purchase_value.toFixed(2)}` : '—'}</div>
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
              <Textarea id="loss-reason" value={lossReason} onChange={(e) => setLossReason(e.target.value)} placeholder="Ex: preço, já tem outro salão, não respondeu..." rows={2} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowLossForm(false)}>Cancelar</Button>
                <Button size="sm" variant="destructive" disabled={!lossReason.trim() || saving} onClick={handleConfirmLoss}>Confirmar perda</Button>
              </div>
            </div>
          )}

          {showConvertForm && (
            <div className="space-y-2 border border-emerald-600/30 rounded-lg p-3">
              <Label htmlFor="purchase-value">Valor da primeira compra (opcional)</Label>
              <Input id="purchase-value" type="number" min="0" step="0.01" value={purchaseValue} onChange={(e) => setPurchaseValue(e.target.value)} placeholder="0,00" />
              <p className="text-xs text-muted-foreground">Isso cria um cadastro em Clientes vinculado a este prospect.</p>
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
