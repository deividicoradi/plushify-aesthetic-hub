
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import CashClosureDialog from './CashClosureDialog';
import CashOpeningDialog from './CashOpeningDialog';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import CashClosureHeader from './cash-closure/CashClosureHeader';
import CashOpeningCard from './cash-closure/CashOpeningCard';
import CashClosureCard from './cash-closure/CashClosureCard';
import { useCashClosureData } from './cash-closure/useCashClosureData';

const CashClosureTab = () => {
  const [isClosureDialogOpen, setIsClosureDialogOpen] = useState(false);
  const [isOpeningDialogOpen, setIsOpeningDialogOpen] = useState(false);
  const [editingClosure, setEditingClosure] = useState<any>(null);
  const [editingOpening, setEditingOpening] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'closure' | 'opening'>('closure');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const {
    cashClosures,
    cashOpenings,
    loadingClosures,
    loadingOpenings,
    handleRefetch,
    deleteClosure,
    deleteOpening,
  } = useCashClosureData();

  const handleEditClosure = (closure: any) => {
    setEditingClosure(closure);
    setIsClosureDialogOpen(true);
  };

  const handleEditOpening = (opening: any) => {
    setEditingOpening(opening);
    setIsOpeningDialogOpen(true);
  };

  const handleDeleteClosure = (closureId: string) => {
    setItemToDelete(closureId);
    setDeleteType('closure');
    setDeleteConfirmOpen(true);
  };

  const handleDeleteOpening = (openingId: string) => {
    setItemToDelete(openingId);
    setDeleteType('opening');
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (deleteType === 'closure') {
        deleteClosure(itemToDelete);
      } else {
        deleteOpening(itemToDelete);
      }
      setItemToDelete(null);
    }
  };

  const handleCloseClosureDialog = () => {
    setIsClosureDialogOpen(false);
    setEditingClosure(null);
  };

  const handleCloseOpeningDialog = () => {
    setIsOpeningDialogOpen(false);
    setEditingOpening(null);
  };

  return (
    <div className="space-y-6">
      <CashClosureHeader
        onOpenCashOpening={() => setIsOpeningDialogOpen(true)}
        onOpenCashClosure={() => setIsClosureDialogOpen(true)}
      />

      <div className="grid gap-6">
        {loadingClosures || loadingOpenings ? (
          <div className="text-center py-8">Carregando dados...</div>
        ) : (
          <>
            {/* Aberturas de Caixa */}
            {cashOpenings && cashOpenings.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Aberturas de Caixa</h3>
                {cashOpenings.map((opening) => (
                  <CashOpeningCard
                    key={opening.id}
                    opening={opening}
                    onEdit={handleEditOpening}
                    onDelete={handleDeleteOpening}
                  />
                ))}
              </div>
            )}

            {/* Fechamentos de Caixa */}
            {cashClosures && cashClosures.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fechamentos de Caixa</h3>
                {cashClosures.map((closure) => (
                  <CashClosureCard
                    key={closure.id}
                    closure={closure}
                    onEdit={handleEditClosure}
                    onDelete={handleDeleteClosure}
                  />
                ))}
              </div>
            )}

            {(!cashOpenings || cashOpenings.length === 0) && (!cashClosures || cashClosures.length === 0) && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">Nenhum registro de caixa encontrado</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <CashClosureDialog 
        open={isClosureDialogOpen} 
        onOpenChange={handleCloseClosureDialog}
        onSuccess={handleRefetch}
        closure={editingClosure}
      />

      <CashOpeningDialog 
        open={isOpeningDialogOpen} 
        onOpenChange={handleCloseOpeningDialog}
        onSuccess={handleRefetch}
        opening={editingOpening}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={deleteType === 'closure' ? 'Excluir Fechamento' : 'Excluir Abertura'}
        description={deleteType === 'closure' 
          ? 'Tem certeza que deseja excluir este fechamento? Esta ação não pode ser desfeita.'
          : 'Tem certeza que deseja excluir esta abertura? Esta ação não pode ser desfeita.'
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
};

export default CashClosureTab;
