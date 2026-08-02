import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ticket, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  discount: number;
  discountKind: 'PERCENTAGE' | 'FIXED';
  notes: string | null;
  maxRedeems: number;
  redeemsCount: number;
  status: string;
  createdAt: string;
}

const formatDiscount = (c: Coupon) =>
  c.discountKind === 'PERCENTAGE' ? `${c.discount / 100}%` : (c.discount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  DISABLED: 'secondary',
};

const callCoupons = async (payload: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('abacate-manage-coupons', {
    body: payload,
  });
  if (error) {
    throw new Error(error.message ?? 'Erro ao comunicar com a AbacatePay');
  }
  if (data?.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
  return data;
};

export const AdminCoupons: React.FC = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountKind, setDiscountKind] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discount, setDiscount] = useState('');
  const [maxRedeems, setMaxRedeems] = useState('');
  const [notes, setNotes] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async (): Promise<Coupon[]> => {
      const result = await callCoupons({ action: 'list' });
      return (result?.coupons ?? []) as Coupon[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const discountNum = Number(discount.replace(',', '.'));
      const maxRedeemsNum = maxRedeems.trim() === '' ? -1 : Number(maxRedeems);
      return callCoupons({
        action: 'create',
        code,
        discountKind,
        discount: discountKind === 'FIXED' ? Math.round(discountNum * 100) : discountNum,
        notes: notes.trim() || undefined,
        maxRedeems: maxRedeemsNum,
      });
    },
    onSuccess: () => {
      toast({ title: 'Cupom criado com sucesso' });
      setOpen(false);
      setCode('');
      setDiscount('');
      setMaxRedeems('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar cupom', description: err.message, variant: 'destructive' });
    },
  });

  const canSubmit = code.trim().length > 0 && discount.trim().length > 0 && !createMutation.isPending;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Ticket className="w-4 h-4 text-primary" />
          Cupons de desconto
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Novo cupom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar cupom de desconto</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="coupon-code">Código</Label>
                <Input
                  id="coupon-code"
                  placeholder="DESCONTO20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipo de desconto</Label>
                  <Select value={discountKind} onValueChange={(v) => setDiscountKind(v as 'PERCENTAGE' | 'FIXED')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Porcentagem (%)</SelectItem>
                      <SelectItem value="FIXED">Valor fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon-discount">
                    {discountKind === 'PERCENTAGE' ? 'Desconto (%)' : 'Desconto (R$)'}
                  </Label>
                  <Input
                    id="coupon-discount"
                    inputMode="decimal"
                    placeholder={discountKind === 'PERCENTAGE' ? '20' : '50,00'}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-max-redeems">Limite de usos (vazio = ilimitado)</Label>
                <Input
                  id="coupon-max-redeems"
                  inputMode="numeric"
                  placeholder="Ilimitado"
                  value={maxRedeems}
                  onChange={(e) => setMaxRedeems(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-notes">Descrição (opcional)</Label>
                <Input
                  id="coupon-notes"
                  placeholder="Ex: campanha de Black Friday"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={!canSubmit} className="w-full">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar cupom'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : error ? (
          <p className="text-destructive text-sm">Erro ao carregar cupons: {(error as Error).message}</p>
        ) : (
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.id}</TableCell>
                    <TableCell>{formatDiscount(c)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.redeemsCount}{c.maxRedeems >= 0 ? ` / ${c.maxRedeems}` : ' / ∞'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status] ?? 'outline'}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[240px] truncate">{c.notes ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
                {(data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      Nenhum cupom criado ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
