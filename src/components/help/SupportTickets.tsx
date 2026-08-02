import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquarePlus, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SupportEvent {
  id: string;
  event_number: number;
  title: string;
  description: string;
  event_type: string;
  status: string;
  priority: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  melhoria: 'Melhoria',
  correcao: 'Correção',
  pequena_melhoria: 'Pequena melhoria',
  pequena_correcao: 'Pequena correção',
};

const STATUS_LABELS: Record<string, string> = {
  aberto: 'Aberto',
  em_analise: 'Em análise',
  em_correcao: 'Em correção',
  concluido: 'Concluído',
  fechado: 'Finalizado',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  aberto: 'outline',
  em_analise: 'secondary',
  em_correcao: 'secondary',
  concluido: 'default',
  fechado: 'default',
};

const PRIORITY_LABELS: Record<string, string> = {
  urgente: 'Urgente',
  atencao: 'Atenção',
  normal: 'Normal',
};

const PRIORITY_CLASS: Record<string, string> = {
  urgente: 'bg-red-600 text-white hover:bg-red-600',
  atencao: 'bg-yellow-500 text-black hover:bg-yellow-500',
  normal: 'bg-muted text-muted-foreground hover:bg-muted',
};

export const SupportTickets: React.FC = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<string>('correcao');

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-support-events'],
    queryFn: async (): Promise<SupportEvent[]> => {
      const { data, error } = await supabase.rpc('get_my_support_events');
      if (error) throw error;
      return (data ?? []) as SupportEvent[];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('submit_support_event', {
        p_title: title,
        p_description: description,
        p_event_type: eventType,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: (eventNumber) => {
      toast({ title: `Chamado #${eventNumber} aberto`, description: 'Vamos analisar e te avisar por e-mail quando houver novidade.' });
      setTitle('');
      setDescription('');
      setEventType('correcao');
      queryClient.invalidateQueries({ queryKey: ['my-support-events'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao abrir chamado', description: err.message, variant: 'destructive' });
    },
  });

  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !submitMutation.isPending;

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquarePlus className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Relatar um problema ou sugestão</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="support-title">Título</Label>
              <Input
                id="support-title"
                placeholder="Ex: Botão de salvar não funciona no financeiro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="correcao">Correção (algo quebrado)</SelectItem>
                  <SelectItem value="pequena_correcao">Pequena correção</SelectItem>
                  <SelectItem value="melhoria">Melhoria</SelectItem>
                  <SelectItem value="pequena_melhoria">Pequena melhoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-description">Descrição</Label>
              <Textarea
                id="support-description"
                placeholder="Descreva com o máximo de detalhes possível: o que aconteceu, onde, e o que você esperava que acontecesse."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <Button type="submit" disabled={!canSubmit}>
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enviar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Meus chamados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : error ? (
            <p className="text-destructive text-sm">Erro ao carregar chamados: {(error as Error).message}</p>
          ) : (data ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Você ainda não abriu nenhum chamado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data ?? []).map((ev) => (
                <div key={ev.id} className="rounded-lg border border-border p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold">#{ev.event_number} · {ev.title}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge className={PRIORITY_CLASS[ev.priority]}>{PRIORITY_LABELS[ev.priority] ?? ev.priority}</Badge>
                      <Badge variant={STATUS_VARIANT[ev.status] ?? 'outline'}>{STATUS_LABELS[ev.status] ?? ev.status}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{TYPE_LABELS[ev.event_type] ?? ev.event_type} · aberto em {new Date(ev.created_at).toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm text-muted-foreground">{ev.description}</p>
                  {ev.admin_response && (
                    <div className="mt-2 rounded-md bg-muted/60 p-2.5 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Resposta da equipe:</p>
                      {ev.admin_response}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
