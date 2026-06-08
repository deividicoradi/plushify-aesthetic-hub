
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Calculator, Receipt, TrendingUp, FileText } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { FeatureGuard } from '@/components/FeatureGuard';
import PaymentsTab from '@/components/financial/PaymentsTab';
import CashClosureTab from '@/components/financial/CashClosureTab';
import InstallmentsTab from '@/components/financial/InstallmentsTab';
import ExpensesTab from '@/components/financial/ExpensesTab';
import ReportsTab from '@/components/financial/ReportsTab';
import { CashStatusProvider } from '@/components/financial/CashStatusProvider';

const Financial = () => {
  const [activeTab, setActiveTab] = useState('cash-closure');

  return (
    <CashStatusProvider>
      <ResponsiveLayout
        title="Financeiro"
        subtitle="Gerencie pagamentos, fechamento de caixa, parcelamentos e relatórios"
        icon={CreditCard}
      >
        <FeatureGuard 
          planFeature="hasFinancialManagement"
          showUpgradePrompt={true}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto -mx-1 px-1">
              <TabsList className="grid grid-cols-5 w-full min-w-[420px] sm:min-w-0 h-auto">
                <TabsTrigger value="cash-closure" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
                  <Receipt className="w-4 h-4 shrink-0" />
                  <span>Caixa</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Pagamentos</span>
                </TabsTrigger>
                <FeatureGuard
                  planFeature="hasRecurringPayments"
                  fallback={
                    <TabsTrigger value="installments" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 opacity-50 cursor-not-allowed text-[11px] sm:text-sm py-2" disabled>
                      <Calculator className="w-4 h-4 shrink-0" />
                      <span>Parcelas</span>
                    </TabsTrigger>
                  }
                >
                  <TabsTrigger value="installments" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
                    <Calculator className="w-4 h-4 shrink-0" />
                    <span>Parcelas</span>
                  </TabsTrigger>
                </FeatureGuard>
                <TabsTrigger value="expenses" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>Despesas</span>
                </TabsTrigger>
                <FeatureGuard
                  planFeature="hasReportsDetailed"
                  fallback={
                    <TabsTrigger value="reports" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 opacity-50 cursor-not-allowed text-[11px] sm:text-sm py-2" disabled>
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>Relatórios</span>
                    </TabsTrigger>
                  }
                >
                  <TabsTrigger value="reports" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm py-2">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Relatórios</span>
                  </TabsTrigger>
                </FeatureGuard>
              </TabsList>
            </div>

            <TabsContent value="cash-closure" className="space-y-4 sm:space-y-6">
              <CashClosureTab />
            </TabsContent>

            <TabsContent value="payments" className="space-y-4 sm:space-y-6">
              <PaymentsTab />
            </TabsContent>

            <TabsContent value="installments" className="space-y-4 sm:space-y-6">
              <FeatureGuard 
                planFeature="hasRecurringPayments"
                showUpgradePrompt={true}
              >
                <InstallmentsTab />
              </FeatureGuard>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4 sm:space-y-6">
              <ExpensesTab />
            </TabsContent>

            <TabsContent value="reports" className="space-y-4 sm:space-y-6">
              <FeatureGuard 
                planFeature="hasReportsDetailed"
                showUpgradePrompt={true}
              >
                <ReportsTab />
              </FeatureGuard>
            </TabsContent>
          </Tabs>
        </FeatureGuard>
      </ResponsiveLayout>
    </CashStatusProvider>
  );
};

export default Financial;
