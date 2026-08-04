import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Prospector } from './types';

interface ProspectorsManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

export const ProspectorsManageDialog: React.FC<ProspectorsManageDialogProps> = ({ open, onOpenChange, onChanged }) => {
  const [prospectors, setProspectors] = useState<Prospector[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_prospectors');
    if (error) {
      toast.error('Erro ao carregar equipe: ' + error.message);
    } else {
      setProspectors((data || []) as Prospector[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const { error } = await supabase.rpc('admin_create_prospector', { p_name: newName.trim() });
    setSaving(false);
    if (error) {
      toast.error('Erro ao adicionar: ' + error.message);
      return;
    }
    setNewName('');
    load();
    onChanged();
    toast.success('Pessoa adicionada!');
  };

  const startEdit = (p: Prospector) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const handleSaveEdit = async (p: Prospector) => {
    if (!editingName.trim()) return;
    setSaving(true);
    const { error } = await supabase.rpc('admin_update_prospector', {
      p_id: p.id,
      p_name: editingName.trim(),
      p_active: p.active,
    });
    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar: ' + error.message);
      return;
    }
    setEditingId(null);
    load();
    onChanged();
  };

  const handleToggleActive = async (p: Prospector) => {
    const { error } = await supabase.rpc('admin_update_prospector', {
      p_id: p.id,
      p_name: p.name,
      p_active: !p.active,
    });
    if (error) {
      toast.error('Erro ao atualizar: ' + error.message);
      return;
    }
    load();
    onChanged();
  };

  const handleDelete = async (p: Prospector) => {
    const { error } = await supabase.rpc('admin_delete_prospector', { p_id: p.id });
    if (error) {
      toast.error('Erro ao remover: ' + error.message);
      return;
    }
    load();
    onChanged();
    toast.success('Removido (ou desativado, se já tinha prospects vinculados).');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Equipe de prospecção</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome da pessoa"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button size="icon" disabled={!newName.trim() || saving} onClick={handleAdd}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
          ) : prospectors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Ninguém cadastrado ainda.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {prospectors.map((p) => (
                <div key={p.id} className="flex items-center gap-2 border border-border/50 rounded-md p-2">
                  {editingId === p.id ? (
                    <>
                      <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="flex-1 h-8" />
                      <Button size="icon" variant="ghost" className="h-8 w-8" disabled={saving} onClick={() => handleSaveEdit(p)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm">{p.name}</span>
                      {!p.active && <Badge variant="outline" className="text-xs">Inativo</Badge>}
                      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => handleToggleActive(p)}>
                        {p.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(p)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(p)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
