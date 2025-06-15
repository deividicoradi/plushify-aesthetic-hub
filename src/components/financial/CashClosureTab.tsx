
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FeatureGuard } from '@/components/FeatureGuard';
import CashClosureDialog from './CashClosureDialog';
import CashOpeningDialog from './CashOpeningDialog';
import CashClosureHeader from './cash-closure/CashClosureHeader';
import CashOpeningCard from './cash-closure/CashOpeningCard';
import CashClosureCard from './cash-closure/CashClosureCard';
import { useCashClosureData } from './cash-closure/useCashClosureData';

const CashClosureTab = () => {
  const [isClosureDialogOpen, setIsClosureDialogOpen] = useState(false);
  const [isOpeningDialogOpen, setIsOpeningDialogOpen] = useState(false);

  const {
    cashClosures,
    cashOpenings,
    loadingClosures,
    loadingOpenings,
    handleRefetch,
  } = useCashClosureData();

  return (
    <div className="space-y-6">
      <FeatureGuard 
        planFeature="hasCashFlow"
        showUpgradePrompt={true}
      >
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
          onOpenChange={setIsClosureDialogOpen}
          onSuccess={handleRefetch}
        />

        <CashOpeningDialog 
          open={isOpeningDialogOpen} 
          onOpenChange={setIsOpeningDialogOpen}
          onSuccess={handleRefetch}
        />
      </FeatureGuard>
    </div>
  );
};

export default CashClosureTab;
