import React, { useEffect, useState } from 'react';
import { Handshake, Plus } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProspectList } from '@/components/prospects/ProspectList';
import { ProspectFormDialog } from '@/components/prospects/ProspectFormDialog';
import { ProspectDetailDialog } from '@/components/prospects/ProspectDetailDialog';
import { StaleProspectsPanel } from '@/components/prospects/StaleProspectsPanel';
import { ProspectMetricsPanel } from '@/components/prospects/ProspectMetricsPanel';
import { Prospect, ProspectStatus, useProspects } from '@/hooks/useProspects';

const STATUS_FILTER_LABELS: Record<ProspectStatus | 'todos', string> = {
  todos: 'Todos os status',
  novo: 'Novo',
  contatado: 'Contatado',
  interessado: 'Interessado',
  negociando: 'Negociando',
  convertido: 'Convertido',
  perdido: 'Perdido',
};

const Prospects = () => {
  const { prospects, loading, fetchProspects } = useProspects();
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'todos'>('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  useEffect(() => {
    fetchProspects(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSelectProspect = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setDetailOpen(true);
  };

  const handleSelectById = (id: string) => {
    const found = prospects.find((p) => p.id === id);
    if (found) {
      handleSelectProspect(found);
    }
  };

  const refresh = () => fetchProspects(statusFilter);

  return (
    <>
      <ResponsiveLayout
        title="Comercial"
        subtitle="Prospecção de clientes e follow-up"
        icon={Handshake}
      >
        <Tabs defaultValue="lista" className="mt-4 sm:mt-6">
          <TabsList className="grid w-full grid-cols-3 h-11 sm:h-10">
            <TabsTrigger value="lista">Prospects</TabsTrigger>
            <TabsTrigger value="followup">Follow-up</TabsTrigger>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProspectStatus | 'todos')}>
                <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_FILTER_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => { setEditingProspect(null); setFormOpen(true); }} className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Novo prospect
              </Button>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-border/50">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Prospects</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Clique num prospect para ver histórico e registrar contato</p>
              </div>
              <div className="p-3 sm:p-4 lg:p-6">
                <ProspectList prospects={prospects} loading={loading} onSelect={handleSelectProspect} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="followup" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <StaleProspectsPanel onSelect={handleSelectById} />
          </TabsContent>

          <TabsContent value="metricas" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <ProspectMetricsPanel />
          </TabsContent>
        </Tabs>
      </ResponsiveLayout>

      <ProspectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        prospect={editingProspect}
        onSuccess={refresh}
      />

      <ProspectDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        prospect={selectedProspect}
        onChanged={refresh}
      />
    </>
  );
};

export default Prospects;
