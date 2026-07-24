import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { useLoyaltyConfig, LoyaltyTier, LoyaltyChallenge, LoyaltyReward } from '@/hooks/loyalty/useLoyaltyConfig';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoyaltyConfigDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const cfg = useLoyaltyConfig();
  const { settings, tiers, challenges, rewards, loading, saveSettings, upsertTier, deleteTier, upsertChallenge, deleteChallenge, upsertReward, deleteReward } = cfg;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurar Fidelidade</DialogTitle>
          <DialogDescription>Personalize o programa de fidelidade do seu estabelecimento.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : (
          <Tabs defaultValue="points" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
              <TabsTrigger value="points">Pontuação</TabsTrigger>
              <TabsTrigger value="tiers">Níveis</TabsTrigger>
              <TabsTrigger value="challenges">Desafios</TabsTrigger>
              <TabsTrigger value="rewards">Recompensas</TabsTrigger>
              <TabsTrigger value="vip">VIP</TabsTrigger>
              <TabsTrigger value="how">Como Funciona</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto min-h-0 mt-3 pr-3">
              <TabsContent value="points"><PointsTab settings={settings} onSave={saveSettings} /></TabsContent>
              <TabsContent value="tiers"><TiersTab tiers={tiers} upsert={upsertTier} onDelete={deleteTier} /></TabsContent>
              <TabsContent value="challenges"><ChallengesTab items={challenges} upsert={upsertChallenge} onDelete={deleteChallenge} /></TabsContent>
              <TabsContent value="rewards"><RewardsTab items={rewards} tiers={tiers} upsert={upsertReward} onDelete={deleteReward} /></TabsContent>
              <TabsContent value="vip"><VipTab settings={settings} onSave={saveSettings} tiers={tiers} /></TabsContent>
              <TabsContent value="how"><HowItWorksTab settings={settings} onSave={saveSettings} /></TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ============ POINTS TAB ============
const PointsTab: React.FC<{ settings: any; onSave: (p: any) => void }> = ({ settings, onSave }) => {
  const [active, setActive] = useState(settings?.points_active ?? true);
  const [ppc, setPpc] = useState(settings?.points_per_currency ?? 1);
  const [validity, setValidity] = useState<number | ''>(settings?.points_validity_days ?? '');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border rounded-md p-3">
        <div><Label>Geração automática de pontos</Label>
          <p className="text-xs text-muted-foreground">Creditar pontos automaticamente quando o pagamento for confirmado.</p>
        </div>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Pontos por R$ 1,00 gasto</Label>
          <Input type="number" step="0.01" min={0} value={ppc} onChange={(e) => setPpc(Number(e.target.value))} />
        </div>
        <div>
          <Label>Validade dos pontos (dias)</Label>
          <Input type="number" min={0} value={validity} onChange={(e) => setValidity(e.target.value ? Number(e.target.value) : '')} placeholder="Sem validade" />
        </div>
      </div>
      <Button onClick={() => onSave({ points_active: active, points_per_currency: ppc, points_validity_days: validity === '' ? null : validity })}>
        <Save className="w-4 h-4 mr-2" />Salvar
      </Button>
    </div>
  );
};

// ============ TIERS TAB ============
const TiersTab: React.FC<{ tiers: LoyaltyTier[]; upsert: (t: any) => void; onDelete: (id: string) => void }> = ({ tiers, upsert, onDelete }) => {
  const [drafts, setDrafts] = useState<Record<string, LoyaltyTier>>({});
  const get = (t: LoyaltyTier) => drafts[t.id] ?? t;
  const set = (id: string, patch: Partial<LoyaltyTier>) => setDrafts(d => ({ ...d, [id]: { ...(d[id] ?? tiers.find(x => x.id === id)!), ...patch } }));
  return (
    <div className="space-y-3">
      {tiers.map(t => {
        const d = get(t);
        return (
          <div key={t.id} className="border rounded-md p-3 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Input value={d.name} onChange={e => set(t.id, { name: e.target.value })} placeholder="Nome" />
              <Input type="number" value={d.min_spent} onChange={e => set(t.id, { min_spent: Number(e.target.value) })} placeholder="Valor mín. (R$)" />
              <Input type="number" value={d.min_points} onChange={e => set(t.id, { min_points: Number(e.target.value) })} placeholder="Pontos mín." />
              <Input type="color" value={d.color} onChange={e => set(t.id, { color: e.target.value })} className="h-9 p-1" />
            </div>
            <Input value={d.benefit ?? ''} onChange={e => set(t.id, { benefit: e.target.value })} placeholder="Benefício" />
            <Textarea value={d.description ?? ''} onChange={e => set(t.id, { description: e.target.value })} placeholder="Descrição" rows={2} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={d.active} onCheckedChange={v => set(t.id, { active: v })} /><span className="text-xs">Ativo</span>
                <Input type="number" className="w-20 h-8" value={d.sort_order} onChange={e => set(t.id, { sort_order: Number(e.target.value) })} title="Ordem" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => upsert(d)}>Salvar</Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Excluir nível "${t.name}"?`)) onDelete(t.id); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
      <Button variant="outline" onClick={() => upsert({ name: 'Novo Nível', min_spent: 0, min_points: 0, color: '#a16207', sort_order: tiers.length + 1, active: true })}>
        <Plus className="w-4 h-4 mr-1" />Novo nível
      </Button>
    </div>
  );
};

// ============ CHALLENGES TAB ============
const ChallengesTab: React.FC<{ items: LoyaltyChallenge[]; upsert: (c: any) => void; onDelete: (id: string) => void }> = ({ items, upsert, onDelete }) => {
  const [drafts, setDrafts] = useState<Record<string, LoyaltyChallenge>>({});
  const get = (c: LoyaltyChallenge) => drafts[c.id] ?? c;
  const set = (id: string, patch: Partial<LoyaltyChallenge>) => setDrafts(d => ({ ...d, [id]: { ...(d[id] ?? items.find(x => x.id === id)!), ...patch } }));
  return (
    <div className="space-y-3">
      {items.map(c => {
        const d = get(c);
        return (
          <div key={c.id} className="border rounded-md p-3 space-y-2">
            <Input value={d.title} onChange={e => set(c.id, { title: e.target.value })} placeholder="Título" />
            <Textarea value={d.description ?? ''} onChange={e => set(c.id, { description: e.target.value })} rows={2} placeholder="Descrição" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select value={d.goal_type} onValueChange={v => set(c.id, { goal_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visits">Agendamentos</SelectItem>
                  <SelectItem value="spending">Valor gasto</SelectItem>
                  <SelectItem value="referral">Indicações</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" value={d.target_value} onChange={e => set(c.id, { target_value: Number(e.target.value) })} placeholder="Meta" />
              <Select value={d.difficulty} onValueChange={v => set(c.id, { difficulty: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
              <Select value={d.status} onValueChange={v => set(c.id, { status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="finished">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input type="date" value={d.period_start ?? ''} onChange={e => set(c.id, { period_start: e.target.value || null })} />
              <Input type="date" value={d.period_end ?? ''} onChange={e => set(c.id, { period_end: e.target.value || null })} />
              <Input value={d.audience} onChange={e => set(c.id, { audience: e.target.value })} placeholder="Público" />
            </div>
            <Input value={d.reward ?? ''} onChange={e => set(c.id, { reward: e.target.value })} placeholder="Recompensa" />
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={() => upsert(d)}>Salvar</Button>
              <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Excluir desafio "${c.title}"?`)) onDelete(c.id); }}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
      <Button variant="outline" onClick={() => upsert({ title: 'Novo desafio', description: '', goal_type: 'visits', target_value: 1, difficulty: 'easy', audience: 'all', status: 'active' })}>
        <Plus className="w-4 h-4 mr-1" />Novo desafio
      </Button>
    </div>
  );
};

// ============ REWARDS TAB ============
const RewardsTab: React.FC<{ items: LoyaltyReward[]; tiers: LoyaltyTier[]; upsert: (r: any) => void; onDelete: (id: string) => void }> = ({ items, tiers, upsert, onDelete }) => {
  const [drafts, setDrafts] = useState<Record<string, LoyaltyReward>>({});
  const get = (r: LoyaltyReward) => drafts[r.id] ?? r;
  const set = (id: string, patch: Partial<LoyaltyReward>) => setDrafts(d => ({ ...d, [id]: { ...(d[id] ?? items.find(x => x.id === id)!), ...patch } }));
  return (
    <div className="space-y-3">
      {items.map(r => {
        const d = get(r);
        return (
          <div key={r.id} className="border rounded-md p-3 space-y-2">
            <Input value={d.title} onChange={e => set(r.id, { title: e.target.value })} placeholder="Título" />
            <Textarea value={d.description ?? ''} onChange={e => set(r.id, { description: e.target.value })} rows={2} placeholder="Descrição" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Input type="number" value={d.points_cost} onChange={e => set(r.id, { points_cost: Number(e.target.value) })} placeholder="Custo (pts)" />
              <Select value={d.reward_type} onValueChange={v => set(r.id, { reward_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Desconto</SelectItem>
                  <SelectItem value="service">Serviço</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="experience">Experiência</SelectItem>
                </SelectContent>
              </Select>
              <Select value={d.tier_name ?? ''} onValueChange={v => set(r.id, { tier_name: v || null })}>
                <SelectTrigger><SelectValue placeholder="Nível mín." /></SelectTrigger>
                <SelectContent>
                  {tiers.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" value={d.validity_days ?? ''} onChange={e => set(r.id, { validity_days: e.target.value ? Number(e.target.value) : null })} placeholder="Validade (dias)" />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1"><Switch checked={d.available} onCheckedChange={v => set(r.id, { available: v })} />Disponível</label>
                <label className="flex items-center gap-1"><Switch checked={d.active} onCheckedChange={v => set(r.id, { active: v })} />Ativo</label>
                <label className="flex items-center gap-1"><Switch checked={d.popular} onCheckedChange={v => set(r.id, { popular: v })} />Popular</label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => upsert(d)}>Salvar</Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Excluir recompensa "${r.title}"?`)) onDelete(r.id); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
      <Button variant="outline" onClick={() => upsert({ title: 'Nova recompensa', description: '', points_cost: 100, reward_type: 'discount', tier_name: tiers[0]?.name ?? null, available: true, active: true, popular: false })}>
        <Plus className="w-4 h-4 mr-1" />Nova recompensa
      </Button>
    </div>
  );
};

// ============ VIP TAB ============
const VipTab: React.FC<{ settings: any; onSave: (p: any) => void; tiers: LoyaltyTier[] }> = ({ settings, onSave, tiers }) => {
  const initial = settings?.vip_criteria ?? { type: 'all_active' };
  const [type, setType] = useState<string>(initial.type ?? 'all_active');
  const [minSpent, setMinSpent] = useState<number>(initial.min_spent ?? 500);
  const [minPoints, setMinPoints] = useState<number>(initial.min_points ?? 500);
  const [tierName, setTierName] = useState<string>(initial.tier_name ?? tiers[0]?.name ?? '');
  const [minVisits, setMinVisits] = useState<number>(initial.min_visits ?? 5);

  const build = () => {
    if (type === 'all_active') return { type };
    if (type === 'min_spent') return { type, min_spent: minSpent };
    if (type === 'min_points') return { type, min_points: minPoints };
    if (type === 'min_tier') return { type, tier_name: tierName };
    if (type === 'frequency') return { type, min_visits: minVisits };
    return { type };
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Defina o que torna um cliente VIP no seu estabelecimento.</p>
      <Select value={type} onValueChange={setType}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all_active">Todos os clientes ativos</SelectItem>
          <SelectItem value="min_spent">Valor gasto mínimo</SelectItem>
          <SelectItem value="min_points">Pontos mínimos</SelectItem>
          <SelectItem value="min_tier">Nível mínimo</SelectItem>
          <SelectItem value="frequency">Frequência mínima (agendamentos)</SelectItem>
        </SelectContent>
      </Select>
      {type === 'min_spent' && <div><Label>Valor gasto mínimo (R$)</Label><Input type="number" value={minSpent} onChange={e => setMinSpent(Number(e.target.value))} /></div>}
      {type === 'min_points' && <div><Label>Pontos mínimos</Label><Input type="number" value={minPoints} onChange={e => setMinPoints(Number(e.target.value))} /></div>}
      {type === 'min_tier' && (
        <div><Label>Nível mínimo</Label>
          <Select value={tierName} onValueChange={setTierName}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{tiers.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      {type === 'frequency' && <div><Label>Agendamentos mínimos</Label><Input type="number" value={minVisits} onChange={e => setMinVisits(Number(e.target.value))} /></div>}
      <Button onClick={() => onSave({ vip_criteria: build() })}><Save className="w-4 h-4 mr-2" />Salvar</Button>
    </div>
  );
};

// ============ HOW IT WORKS TAB ============
const HowItWorksTab: React.FC<{ settings: any; onSave: (p: any) => void }> = ({ settings, onSave }) => {
  const [blocks, setBlocks] = useState<any[]>(Array.isArray(settings?.how_it_works) ? settings.how_it_works : []);
  const upd = (i: number, patch: any) => setBlocks(b => b.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  const add = () => setBlocks(b => [...b, { id: `block-${Date.now()}`, title: 'Novo bloco', description: '', active: true }]);
  const del = (i: number) => setBlocks(b => b.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <div key={b.id ?? i} className="border rounded-md p-3 space-y-2">
          <Input value={b.title} onChange={e => upd(i, { title: e.target.value })} placeholder="Título" />
          <Textarea value={b.description} onChange={e => upd(i, { description: e.target.value })} rows={2} placeholder="Descrição" />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs">
              <Switch checked={!!b.active} onCheckedChange={v => upd(i, { active: v })} />Exibir
            </label>
            <Button size="sm" variant="destructive" onClick={() => del(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" onClick={add}><Plus className="w-4 h-4 mr-1" />Novo bloco</Button>
        <Button onClick={() => onSave({ how_it_works: blocks })}><Save className="w-4 h-4 mr-2" />Salvar textos</Button>
      </div>
    </div>
  );
};