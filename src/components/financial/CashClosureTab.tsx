import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from 'lucide-react';
import { useCashClosureData } from '@/hooks/financial/useCashClosureData';
import CashClosureDialog from './CashClosureDialog';
import CashOpeningDialog from './CashOpeningDialog';
import CashSearchAndFilters from './CashSearchAndFilters';
import { useCashStatus } from './CashStatusProvider';
import CashClosureCard from './cash-closure/CashClosureCard';
import CashOpeningCard from './cash-closure/CashOpeningCard';

const CashClosureTab = () => {
  const [isClosureDialogOpen, setIsClosureDialogOpen] = useState(false);
  const [isOpeningDialogOpen, setIsOpeningDialogOpen] = useState(false);
  const [editingClosure, setEditingClosure] = useState<any>(null);
  const [editingOpening, setEditingOpening] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter data based on search and filters
  const filteredData = () => {
    let openingsData = cashOpenings || [];
    let closuresData = cashClosures || [];

    // Apply search filter
    if (searchTerm) {
      openingsData = openingsData.filter(item => 
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      closuresData = closuresData.filter(item => 
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filters
    if (filters.dateFrom) {
      openingsData = openingsData.filter(item => item.opening_date >= filters.dateFrom);
      closuresData = closuresData.filter(item => item.closure_date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      openingsData = openingsData.filter(item => item.opening_date <= filters.dateTo);
      closuresData = closuresData.filter(item => item.closure_date <= filters.dateTo);
    }

    // Apply type filter
    let combinedData = [];
    if (filters.type === 'all' || filters.type === 'opening') {
      combinedData.push(...openingsData.map(item => ({ ...item, type: 'opening' })));
    }
    if (filters.type === 'all' || filters.type === 'closure') {
      combinedData.push(...closuresData.map(item => ({ ...item, type: 'closure' })));
    }

    // Sort by date
    return combinedData.sort((a, b) => {
      const dateA = new Date(a.opening_date || a.closure_date);
      const dateB = new Date(b.opening_date || b.closure_date);
      return dateB.getTime() - dateA.getTime();
    });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Controle de Caixa</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleCreateOpening} 
            className="gap-2"
            disabled={!canOpenCash}
            variant={canOpenCash ? "default" : "secondary"}
          >
            <FolderOpen className="w-4 h-4" />
            {canOpenCash ? 'Abrir Caixa' : 'Caixa Aberto'}
          </Button>
          <Button 
            onClick={handleCreateClosure} 
            variant="outline" 
            className="gap-2"
            disabled={!canCloseCash}
          >
            <Plus className="w-4 h-4" />
            {canCloseCash ? 'Fechar Caixa' : 'Abra o Caixa Primeiro'}
          </Button>
        </div>
      </div>

      <CashSearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {loadingClosures || loadingOpenings ? (
        <div className="text-center py-8">Carregando dados...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData().map((item) => {
            if (item.type === 'opening') {
              return (
                <CashOpeningCard
                  key={`opening-${item.id}`}
                  opening={item}
                  onEdit={(opening) => {
                    setEditingOpening(opening);
                    setIsOpeningDialogOpen(true);
                  }}
                  onDelete={deleteOpening}
                />
              );
            } else {
              return (
                <CashClosureCard
                  key={`closure-${item.id}`}
                  closure={item}
                  onEdit={(closure) => {
                    setEditingClosure(closure);
                    setIsClosureDialogOpen(true);
                  }}
                  onDelete={deleteClosure}
                />
              );
            }
          })}
        </div>
      )}

      {filteredData().length === 0 && !loadingClosures && !loadingOpenings && (
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