import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Calculator, Wallet, CreditCard, Smartphone, Banknote, MoreVertical, Edit, Trash2,
  StickyNote, ChevronDown, ChevronUp, DoorOpen, Lock, TrendingUp, TrendingDown, AlertTriangle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const PAYMENT_METHOD_STYLES = {
  emerald: { box: 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40', icon: 'text-emerald-600 dark:text-emerald-400', label: 'text-emerald-700 dark:text-emerald-300' },
  blue: { box: 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40', icon: 'text-blue-600 dark:text-blue-400', label: 'text-blue-700 dark:text-blue-300' },
  purple: { box: 'bg-purple-50/80 dark:bg-purple-950/20 border-purple-200/60 dark:border-purple-800/40', icon: 'text-purple-600 dark:text-purple-400', label: 'text-purple-700 dark:text-purple-300' },
  orange: { box: 'bg-orange-50/80 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-800/40', icon: 'text-orange-600 dark:text-orange-400', label: 'text-orange-700 dark:text-orange-300' },
} as const;

const PaymentMethodsGrid = ({ data }: { data: any }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 pb-1 border-b border-border/50">
      <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Métodos de Pagamento</h4>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {[
        { label: 'Dinheiro', icon: Banknote, value: data.cash_amount, color: 'emerald' as const },
        { label: 'Cartão', icon: CreditCard, value: data.card_amount, color: 'blue' as const },
        { label: 'PIX', icon: Smartphone, value: data.pix_amount, color: 'purple' as const },
        { label: 'Outros', icon: Calculator, value: data.other_amount, color: 'orange' as const },
      ].map(({ label, icon: Icon, value, color }) => {
        const s = PAYMENT_METHOD_STYLES[color];
        return (
          <div key={label} className={`border rounded-lg p-2.5 text-center ${s.box}`}>
            <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${s.icon}`} />
            <p className={`text-[10px] font-medium uppercase ${s.label}`}>{label}</p>
            <p className="text-xs font-bold text-foreground">{formatCurrency(Number(value))}</p>
          </div>
        );
      })}
    </div>
  </div>
);

const NotesAndMeta = ({ data }: { data: any }) => (
  <>
    {data.notes && (
      <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-lg p-2.5">
        <div className="flex items-start gap-2">
          <StickyNote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">{data.notes}</p>
        </div>
      </div>
    )}
    {(data.operator_id || data.machine_id) && (
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {data.operator_id && <span>Operador: <code className="bg-muted px-1.5 py-0.5 rounded">{data.operator_id.slice(0, 8)}...</code></span>}
        {data.machine_id && <span>Terminal: <code className="bg-muted px-1.5 py-0.5 rounded">{data.machine_id.slice(-8)}</code></span>}
      </div>
    )}
  </>
);

interface CashCycleRowProps {
  date: string;
  opening?: any;
  closure?: any;
  onEditOpening?: (opening: any) => void;
  onDeleteOpening?: (id: string) => void;
  onEditClosure?: (closure: any) => void;
  onDeleteClosure?: (id: string) => void;
}

const CashCycleRow: React.FC<CashCycleRowProps> = ({
  date, opening, closure, onEditOpening, onDeleteOpening, onEditClosure, onDeleteClosure,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isClosed = closure?.status === 'fechado';
  const difference = Number(closure?.difference) || 0;
  const hasDifference = Math.abs(difference) > 0.01;

  return (
    <Card className="w-full overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300">
      {/* Linha compacta — sempre visível */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-3 sm:p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`shrink-0 p-2 rounded-lg border ${isClosed ? 'bg-destructive/10 border-destructive/20' : 'bg-primary/10 border-primary/20'}`}>
            {isClosed ? <Lock className="w-4 h-4 text-destructive" /> : <DoorOpen className="w-4 h-4 text-primary" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-xs text-muted-foreground">
              Saldo inicial {formatCurrency(Number(opening?.opening_balance ?? closure?.opening_balance ?? 0))}
              {closure && <> → final {formatCurrency(Number(closure.closing_balance))}</>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge className={isClosed ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}>
            {isClosed ? 'Fechado' : 'Aberto'}
          </Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Detalhe completo — só quando expandido */}
      {expanded && (
        <CardContent className="p-4 pt-0 space-y-4 border-t border-border/50">
          {opening && (
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <DoorOpen className="w-4 h-4 text-primary" /> Abertura de Caixa
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    {format(new Date(opening.opened_at), 'HH:mm', { locale: ptBR })}
                  </span>
                </h3>
                {(onEditOpening || onDeleteOpening) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreVertical className="h-3.5 w-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      {onEditOpening && <DropdownMenuItem onClick={() => onEditOpening(opening)} className="gap-2 text-xs"><Edit className="h-3.5 w-3.5" />Editar</DropdownMenuItem>}
                      {onDeleteOpening && <DropdownMenuItem onClick={() => onDeleteOpening(opening.id)} className="gap-2 text-xs text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5" />Deletar</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <PaymentMethodsGrid data={opening} />
              <NotesAndMeta data={opening} />
            </div>
          )}

          {closure && (
            <div className={`space-y-2 ${opening ? 'pt-4 border-t border-border/50' : 'pt-4'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-destructive" /> Fechamento de Caixa
                  {closure.closed_at && (
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      {format(new Date(closure.closed_at), 'HH:mm', { locale: ptBR })}
                    </span>
                  )}
                </h3>
                {(onEditClosure || onDeleteClosure) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreVertical className="h-3.5 w-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      {onEditClosure && <DropdownMenuItem onClick={() => onEditClosure(closure)} className="gap-2 text-xs"><Edit className="h-3.5 w-3.5" />Editar</DropdownMenuItem>}
                      {onDeleteClosure && <DropdownMenuItem onClick={() => onDeleteClosure(closure.id)} className="gap-2 text-xs text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5" />Deletar</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300 uppercase">Saldo Inicial</p>
                  <p className="text-xs font-bold text-foreground">{formatCurrency(Number(closure.opening_balance))}</p>
                </div>
                <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 uppercase">Receitas</p>
                  <p className="text-xs font-bold text-foreground">{formatCurrency(Number(closure.total_income))}</p>
                </div>
                <div className="bg-red-50/80 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] font-medium text-red-700 dark:text-red-300 uppercase">Despesas</p>
                  <p className="text-xs font-bold text-foreground">{formatCurrency(Number(closure.total_expenses))}</p>
                </div>
                <div className="bg-green-50/80 dark:bg-green-950/20 border border-green-200/60 dark:border-green-800/40 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] font-medium text-green-700 dark:text-green-300 uppercase">Saldo Final</p>
                  <p className="text-xs font-bold text-foreground">{formatCurrency(Number(closure.closing_balance))}</p>
                </div>
              </div>

              <PaymentMethodsGrid data={closure} />

              {hasDifference && (
                <div className={`rounded-lg border p-2.5 flex items-center gap-2 ${difference > 0 ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40' : 'bg-red-50/80 dark:bg-red-950/20 border-red-200/60 dark:border-red-800/40'}`}>
                  {difference > 0 ? <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                  <div>
                    <p className={`text-xs font-semibold ${difference > 0 ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
                      {difference > 0 ? 'Superávit no Caixa' : 'Déficit no Caixa'}
                    </p>
                    <p className="text-xs font-bold text-foreground">{formatCurrency(difference)}</p>
                  </div>
                </div>
              )}

              <NotesAndMeta data={closure} />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default CashCycleRow;
