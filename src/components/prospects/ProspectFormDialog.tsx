import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Prospect, ProspectOrigin, ContactChannel, useProspects } from '@/hooks/useProspects';

const ORIGIN_LABELS: Record<ProspectOrigin, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  indicacao: 'Indicação',
  google: 'Google',
  evento: 'Evento',
  porta: 'Passou na porta',
  outro: 'Outro',
};

const CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  telefone: 'Telefone',
  presencial: 'Presencial',
  email: 'E-mail',
  outro: 'Outro',
};

interface ProspectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect?: Prospect | null;
  onSuccess: () => void;
}

export const ProspectFormDialog: React.FC<ProspectFormDialogProps> = ({ open, onOpenChange, prospect, onSuccess }) => {
  const { createProspect, updateProspect } = useProspects();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    origin: '' as ProspectOrigin | '',
    contact_channel: '' as ContactChannel | '',
    service_interest: '',
    estimated_value: '',
    notes: '',
  });

  useEffect(() => {
    if (prospect) {
      setForm({
        name: prospect.name,
        phone: prospect.phone ?? '',
        email: prospect.email ?? '',
        origin: prospect.origin ?? '',
        contact_channel: prospect.contact_channel ?? '',
        service_interest: prospect.service_interest ?? '',
        estimated_value: prospect.estimated_value != null ? String(prospect.estimated_value) : '',
        notes: prospect.notes ?? '',
      });
    } else {
      setForm({ name: '', phone: '', email: '', origin: '', contact_channel: '', service_interest: '', estimated_value: '', notes: '' });
    }
  }, [prospect, open]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      origin: form.origin || null,
      contact_channel: form.contact_channel || null,
      service_interest: form.service_interest.trim() || null,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      notes: form.notes.trim() || null,
    };

    const result = prospect
      ? await updateProspect(prospect.id, payload as any)
      : await createProspect(payload as any);

    setSaving(false);
    if (result) {
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{prospect ? 'Editar prospect' : 'Novo prospect'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="prospect-name">Nome *</Label>
            <Input id="prospect-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do prospect" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prospect-phone">Telefone</Label>
              <Input id="prospect-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prospect-email">E-mail</Label>
              <Input id="prospect-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={form.origin} onValueChange={(v) => setForm({ ...form, origin: v as ProspectOrigin })}>
                <SelectTrigger><SelectValue placeholder="De onde veio" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ORIGIN_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Canal de contato</Label>
              <Select value={form.contact_channel} onValueChange={(v) => setForm({ ...form, contact_channel: v as ContactChannel })}>
                <SelectTrigger><SelectValue placeholder="Como chamamos" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prospect-service">Serviço de interesse</Label>
              <Input id="prospect-service" value={form.service_interest} onChange={(e) => setForm({ ...form, service_interest: e.target.value })} placeholder="Ex: Design de sobrancelha" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prospect-value">Valor estimado (R$)</Label>
              <Input id="prospect-value" type="number" min="0" step="0.01" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} placeholder="0,00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prospect-notes">Observações</Label>
            <Textarea id="prospect-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anotações gerais sobre o prospect" rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.name.trim()}>
            {saving ? 'Salvando...' : prospect ? 'Salvar alterações' : 'Cadastrar prospect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
