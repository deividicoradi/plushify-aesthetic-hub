import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
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
import { toast } from '@/components/ui/sonner';
import {
  Prospect,
  Prospector,
  ProspectOrigin,
  ContactChannel,
  PlanInterest,
  ORIGIN_LABELS,
  CHANNEL_LABELS,
  PLAN_INTEREST_LABELS,
} from './types';

interface ProspectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect?: Prospect | null;
  onSuccess: () => void;
}

export const ProspectFormDialog: React.FC<ProspectFormDialogProps> = ({ open, onOpenChange, prospect, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [prospectors, setProspectors] = useState<Prospector[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<{ field: string; name: string; status: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    social_link: '',
    origin: '' as ProspectOrigin | '',
    contact_channel: '' as ContactChannel | '',
    plan_interest: '' as PlanInterest | '',
    estimated_value: '',
    notes: '',
    prospector_id: '' as string | '',
  });

  useEffect(() => {
    if (open) {
      supabase.rpc('admin_list_prospectors').then(({ data, error }) => {
        if (!error) setProspectors(((data || []) as Prospector[]).filter(p => p.active || p.id === prospect?.prospector_id));
      });
    }
  }, [open, prospect?.prospector_id]);

  useEffect(() => {
    if (prospect) {
      setForm({
        name: prospect.name,
        phone: prospect.phone ?? '',
        email: prospect.email ?? '',
        social_link: prospect.social_link ?? '',
        origin: prospect.origin ?? '',
        contact_channel: prospect.contact_channel ?? '',
        plan_interest: prospect.plan_interest ?? '',
        estimated_value: prospect.estimated_value != null ? String(prospect.estimated_value) : '',
        notes: prospect.notes ?? '',
        prospector_id: prospect.prospector_id ?? '',
      });
    } else {
      setForm({ name: '', phone: '', email: '', social_link: '', origin: '', contact_channel: '', plan_interest: '', estimated_value: '', notes: '', prospector_id: '' });
    }
    setDuplicateWarning(null);
  }, [prospect, open]);

  const checkDuplicate = async (phone: string, email: string) => {
    if (!phone.trim() && !email.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const { data, error } = await supabase.rpc('admin_find_duplicate_prospect', {
      p_phone: phone.trim() || null,
      p_email: email.trim() || null,
      p_exclude_id: prospect?.id || null,
    });
    if (error) return;
    const match = (data || [])[0] as { name: string; status: string; matched_field: string } | undefined;
    setDuplicateWarning(match ? { field: match.matched_field, name: match.name, status: match.status } : null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const params = {
        p_name: form.name.trim(),
        p_phone: form.phone.trim() || null,
        p_email: form.email.trim() || null,
        p_origin: form.origin || null,
        p_contact_channel: form.contact_channel || null,
        p_plan_interest: form.plan_interest || null,
        p_estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
        p_notes: form.notes.trim() || null,
        p_prospector_id: form.prospector_id || null,
        p_social_link: form.social_link.trim() || null,
      };

      const { error } = prospect
        ? await supabase.rpc('admin_update_prospect', { p_id: prospect.id, ...params })
        : await supabase.rpc('admin_create_prospect', params);

      if (error) throw error;
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error('Erro ao salvar prospect: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
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
              <Input
                id="prospect-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                onBlur={() => checkDuplicate(form.phone, form.email)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prospect-email">E-mail</Label>
              <Input
                id="prospect-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => checkDuplicate(form.phone, form.email)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prospect-social-link">Link da rede social</Label>
            <Input
              id="prospect-social-link"
              value={form.social_link}
              onChange={(e) => setForm({ ...form, social_link: e.target.value })}
              placeholder="https://instagram.com/perfil"
            />
            <p className="text-xs text-muted-foreground">Útil quando ainda não tem telefone nem e-mail — só o perfil da rede social.</p>
          </div>

          {duplicateWarning && (
            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Já existe um prospect com esse {duplicateWarning.field === 'phone' ? 'telefone' : 'e-mail'}: <strong>{duplicateWarning.name}</strong> (status: {duplicateWarning.status}). Não será possível salvar até isso ser corrigido.
              </span>
            </div>
          )}

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
              <Label>Plano de interesse</Label>
              <Select value={form.plan_interest} onValueChange={(v) => setForm({ ...form, plan_interest: v as PlanInterest })}>
                <SelectTrigger><SelectValue placeholder="Qual plano" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PLAN_INTEREST_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prospect-value">Valor estimado (R$/mês)</Label>
              <Input id="prospect-value" type="number" min="0" step="0.01" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} placeholder="0,00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quem está prospectando</Label>
            <Select value={form.prospector_id} onValueChange={(v) => setForm({ ...form, prospector_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione uma pessoa" /></SelectTrigger>
              <SelectContent>
                {prospectors.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}{!p.active ? ' (inativo)' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prospect-notes">Observações</Label>
            <Textarea id="prospect-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anotações gerais sobre o prospect" rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.name.trim() || !!duplicateWarning}>
            {saving ? 'Salvando...' : prospect ? 'Salvar alterações' : 'Cadastrar prospect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
