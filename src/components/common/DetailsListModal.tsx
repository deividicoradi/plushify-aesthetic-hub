import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Inbox } from 'lucide-react';

export type SortOrder = 'desc' | 'asc';
const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export interface DetailsSection<T = any> {
  key: string;
  title: string;
  /** Optional per-section total shown in header (currency-formatted string). */
  totalLabel?: string;
  items: T[];
  getDate: (item: T) => string | null | undefined;
  render: (item: T) => React.ReactNode;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  loading?: boolean;
  headerTotal: string;
  headerTotalLabel?: string;
  headerCount: number;
  sections: DetailsSection[];
  periodLabel?: string;
  emptyLabel?: string;
}

const dateValue = (d?: string | null) => {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
    <Inbox className="w-10 h-10 mb-2 opacity-50" />
    <p className="text-sm">{label}</p>
  </div>
);

function SectionView({
  section,
  sortOrder,
  pageSize,
}: {
  section: DetailsSection;
  sortOrder: SortOrder;
  pageSize: PageSize;
}) {
  const [page, setPage] = React.useState(1);

  const sorted = React.useMemo(() => {
    const arr = [...section.items];
    arr.sort((a, b) => {
      const da = dateValue(section.getDate(a));
      const db = dateValue(section.getDate(b));
      return sortOrder === 'desc' ? db - da : da - db;
    });
    return arr;
  }, [section, sortOrder]);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  React.useEffect(() => {
    setPage(1);
  }, [sortOrder, pageSize, section.key, totalCount]);

  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{section.title}</h4>
        <span className="text-xs text-muted-foreground text-right">
          {totalCount} {totalCount === 1 ? 'registro' : 'registros'}
          {section.totalLabel ? ` · ${section.totalLabel}` : ''}
        </span>
      </div>
      {totalCount === 0 ? (
        <p className="text-xs text-muted-foreground py-2">Nenhum registro.</p>
      ) : (
        <>
          <div className="space-y-1.5">{visible.map((item) => section.render(item))}</div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {start + 1}–{Math.min(start + pageSize, totalCount)} de {totalCount}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const DetailsListModal: React.FC<Props> = ({
  open,
  onOpenChange,
  title,
  description,
  loading = false,
  headerTotal,
  headerTotalLabel,
  headerCount,
  sections,
  periodLabel,
  emptyLabel = 'Nenhum registro encontrado.',
}) => {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
  const [pageSize, setPageSize] = React.useState<PageSize>(20);

  React.useEffect(() => {
    if (open) {
      setSortOrder('desc');
      setPageSize(20);
    }
  }, [open, title]);

  const allEmpty = sections.every((s) => s.items.length === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>{title}</DialogTitle>
            {periodLabel && (
              <Badge variant="outline" className="text-xs">
                {periodLabel}
              </Badge>
            )}
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {headerTotalLabel ?? 'Total'}
                </p>
                <p className="text-xl font-bold">{headerTotal}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Registros</p>
                <p className="text-xl font-bold">{headerCount}</p>
              </div>
            </div>

            {!allEmpty && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))
                  }
                  title="Alternar ordenação por data"
                >
                  {sortOrder === 'desc' ? (
                    <ArrowDownWideNarrow className="w-4 h-4 mr-1.5" />
                  ) : (
                    <ArrowUpWideNarrow className="w-4 h-4 mr-1.5" />
                  )}
                  {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigos'}
                </Button>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-xs text-muted-foreground">Por página</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => setPageSize(Number(v) as PageSize)}
                  >
                    <SelectTrigger className="h-8 w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-5 py-3">
                {allEmpty ? (
                  <EmptyState label={emptyLabel} />
                ) : (
                  sections.map((s) => (
                    <SectionView
                      key={s.key}
                      section={s}
                      sortOrder={sortOrder}
                      pageSize={pageSize}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};