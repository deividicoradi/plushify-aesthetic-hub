import React, { useState } from 'react';
import { parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from 'lucide-react';
import { useCashClosureData } from '@/hooks/financial/useCashClosureData';
import CashClosureDialog from './CashClosureDialog';
import CashOpeningDialog from './CashOpeningDialog';
import CashSearchAndFilters from './CashSearchAndFilters';
import { useCashStatus } from './CashStatusProvider';
import CashCycleRow from './cash-closure/CashCycleRow';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const PAGE_SIZE = 10;

const CashClosureTab = () => {
  const [isClosureDialogOpen, setIsClosureDialogOpen] = useState(false);
  const [isOpeningDialogOpen, setIsOpeningDialogOpen] = useState(false);
  const [editingClosure, setEditingClosure] = useState<any>(null);
  const [editingOpening, setEditingOpening] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: 'all'
  });
  
  const { canOpenCash, canCloseCash, currentOpening, refreshStatus } = useCashStatus();

  const {
    cashClosures = [],
    cashOpenings = [],
    loadingClosures,
    loadingOpenings,
    handleRefetch,
    deleteClosure,
    deleteOpening,
  } = useCashClosureData();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearchTerm, filters.dateFrom, filters.dateTo, filters.type]);

  // Agrupa abertura + fechamento do mesmo dia num único "ciclo de caixa" —
  // antes cada evento virava um card gigante separado, dobrando a altura
  // da lista pra cada dia trabalhado.
  const cycles = () => {
    let openingsData = cashOpenings || [];
    let closuresData = cashClosures || [];

    if (debouncedSearchTerm) {
      openingsData = openingsData.filter(item =>
        item.notes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      closuresData = closuresData.filter(item =>
        item.notes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      openingsData = openingsData.filter(item => item.opening_date >= filters.dateFrom);
      closuresData = closuresData.filter(item => item.closure_date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      openingsData = openingsData.filter(item => item.opening_date <= filters.dateTo);
      closuresData = closuresData.filter(item => item.closure_date <= filters.dateTo);
    }

    const byDate = new Map<string, { date: string; opening?: any; closure?: any }>();
    for (const opening of openingsData) {
      byDate.set(opening.opening_date, { date: opening.opening_date, opening });
    }
    for (const closure of closuresData) {
      const existing = byDate.get(closure.closure_date);
      if (existing) {
        existing.closure = closure;
      } else {
        byDate.set(closure.closure_date, { date: closure.closure_date, closure });
      }
    }

    let result = Array.from(byDate.values());
    if (filters.type === 'opening') result = result.filter(c => c.opening);
    if (filters.type === 'closure') result = result.filter(c => c.closure);

    return result.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  };

  const handleCreateClosure = () => {
    if (!canCloseCash) {
      return;
    }
    setEditingClosure(null);
    setIsClosureDialogOpen(true);
  };

  const handleCreateOpening = () => {
    if (!canOpenCash) {
      return;
    }
    setEditingOpening(null);
    setIsOpeningDialogOpen(true);
  };

  const handleClosureSuccess = () => {
    handleRefetch();
    refreshStatus();
  };

  const handleOpeningSuccess = () => {
    handleRefetch();
    refreshStatus();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Controle de Caixa</h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gerencie aberturas e fechamentos de caixa</p>
      </div>

      <CashSearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        onOpenCash={handleCreateOpening}
        onCloseCash={handleCreateClosure}
        canOpenCash={canOpenCash}
        canCloseCash={canCloseCash}
      />

      {loadingClosures || loadingOpenings ? (
        <div className="text-center py-8">Carregando dados...</div>
      ) : (
        <>
          <div className="space-y-3">
            {cycles().slice(0, visibleCount).map((cycle) => (
              <CashCycleRow
                key={cycle.date}
                date={cycle.date}
                opening={cycle.opening}
                closure={cycle.closure}
                onEditOpening={(opening) => {
                  setEditingOpening(opening);
                  setIsOpeningDialogOpen(true);
                }}
                onDeleteOpening={deleteOpening}
                onEditClosure={(closure) => {
                  setEditingClosure(closure);
                  setIsClosureDialogOpen(true);
                }}
                onDeleteClosure={deleteClosure}
              />
            ))}
          </div>

          {cycles().length > visibleCount && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}

      {cycles().length === 0 && !loadingClosures && !loadingOpenings && (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum registro de caixa encontrado.</p>
          <p className="text-sm">Comece abrindo um caixa.</p>
        </div>
      )}

      <CashOpeningDialog
        open={isOpeningDialogOpen}
        onOpenChange={setIsOpeningDialogOpen}
        onSuccess={handleOpeningSuccess}
        opening={editingOpening}
      />

      <CashClosureDialog
        open={isClosureDialogOpen}
        onOpenChange={setIsClosureDialogOpen}
        onSuccess={handleClosureSuccess}
        closure={editingClosure}
      />
    </div>
  );
};

export default CashClosureTab;