
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

const Financial = () => {
  const [activeTab, setActiveTab] = useState('cash-closure');

  return (
    <ResponsiveLayout
      title="Financeiro"
      subtitle="Gerencie pagamentos, fechamento de caixa, parcelamentos e relatórios"
      icon={CreditCard}
    >
      <FeatureGuard 
        planFeature="hasFinancialManagement"
        showUpgradePrompt={true}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-max sm:w-auto">
              <TabsTrigger value="cash-closure" className="flex items-center gap-2 text-xs sm:text-sm">
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Caixa</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2 text-xs sm:text-sm">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Pagamentos</span>
              </TabsTrigger>
              <FeatureGuard 
                planFeature="hasRecurringPayments"
                fallback={
                  <TabsTrigger value="installments" className="flex items-center gap-2 opacity-50 cursor-not-allowed text-xs sm:text-sm" disabled>
                    <Calculator className="w-4 h-4" />
                    <span className="hidden sm:inline">Parcelamentos</span>
                  </TabsTrigger>
                }
              >
                <TabsTrigger value="installments" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">Parcelamentos</span>
                </TabsTrigger>
              </FeatureGuard>
              <TabsTrigger value="expenses" className="flex items-center gap-2 text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Despesas</span>
              </TabsTrigger>
              <FeatureGuard 
                planFeature="hasReportsDetailed"
                fallback={
                  <TabsTrigger value="reports" className="flex items-center gap-2 opacity-50 cursor-not-allowed text-xs sm:text-sm" disabled>
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Relatórios</span>
                  </TabsTrigger>
                }
              >
                <TabsTrigger value="reports" className="flex items-center gap-2 text-xs sm:text-sm">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Relatórios</span>
                </TabsTrigger>
              </FeatureGuard>
            </TabsList>
          </div>

          <TabsContent value="cash-closure" className="space-y-6">
            <CashClosureTab />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="installments" className="space-y-6">
            <FeatureGuard 
              planFeature="hasRecurringPayments"
              showUpgradePrompt={true}
            >
              <InstallmentsTab />
            </FeatureGuard>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpensesTab />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
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
  );
};

export default Financial;
