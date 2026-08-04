import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProspectMetrics, useProspects } from '@/hooks/useProspects';

const MONTH_LABELS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const buildMonthOptions = () => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({ value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: `${MONTH_LABELS[d.getMonth()]} de ${d.getFullYear()}` });
  }
  return options;
};

export const ProspectMetricsPanel: React.FC = () => {
  const { fetchMetrics } = useProspects();
  const monthOptions = buildMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [metrics, setMetrics] = useState<ProspectMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
      const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
      const data = await fetchMetrics(startDate, endDate);
      setMetrics(data);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-6">Carregando métricas...</p>
      ) : !metrics ? (
        <p className="text-sm text-muted-foreground text-center py-6">Não foi possível carregar as métricas.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Prospectados</p>
            <p className="text-2xl font-bold">{metrics.total_prospected}</p>
          </Card>
          <Card className="p-4 border-emerald-600/30">
            <p className="text-sm text-muted-foreground">Taxa de conversão</p>
            <p className="text-2xl font-bold text-emerald-600">{metrics.conversion_rate}%</p>
            <p className="text-xs text-muted-foreground">{metrics.total_converted} convertidos</p>
          </Card>
          <Card className="p-4 border-destructive/30">
            <p className="text-sm text-muted-foreground">Taxa de perda</p>
            <p className="text-2xl font-bold text-destructive">{metrics.loss_rate}%</p>
            <p className="text-xs text-muted-foreground">{metrics.total_lost} perdidos</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Em aberto</p>
            <p className="text-2xl font-bold">{metrics.total_open}</p>
            <p className="text-xs text-muted-foreground">ainda no funil</p>
          </Card>
        </div>
      )}
    </div>
  );
};
