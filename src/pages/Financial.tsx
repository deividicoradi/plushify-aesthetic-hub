
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Calculator, Receipt, TrendingUp, FileText } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { FeatureGuard } from '@/components/FeatureGuard';
import PaymentsTab from '@/components/financial/PaymentsTab';
import CashClosureTab from '@/components/financial/CashClosureTab';
import InstallmentsTab from '@/components/financial/InstallmentsTab';
import ExpensesTab from '@/components/financial/ExpensesTab';
import ReportsTab from '@/components/financial/ReportsTab';

const Financial = () => {
  const [activeTab, setActiveTab] = useState('cash-closure');

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie pagamentos, fechamento de caixa, parcelamentos e relatórios
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 space-y-6">
          <FeatureGuard 
            planFeature="hasFinancialManagement"
            showUpgradePrompt={true}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
                <TabsTrigger value="cash-closure" className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  <span className="hidden sm:inline">Caixa</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Pagamentos</span>
                </TabsTrigger>
                <FeatureGuard 
                  planFeature="hasRecurringPayments"
                  fallback={
                    <TabsTrigger value="installments" className="flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
                      <Calculator className="w-4 h-4" />
                      <span className="hidden sm:inline">Parcelamentos</span>
                    </TabsTrigger>
                  }
                >
                  <TabsTrigger value="installments" className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    <span className="hidden sm:inline">Parcelamentos</span>
                  </TabsTrigger>
                </FeatureGuard>
                <TabsTrigger value="expenses" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Despesas</span>
                </TabsTrigger>
                <FeatureGuard 
                  planFeature="hasReportsDetailed"
                  fallback={
                    <TabsTrigger value="reports" className="flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Relatórios</span>
                    </TabsTrigger>
                  }
                >
                  <TabsTrigger value="reports" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Relatórios</span>
                  </TabsTrigger>
                </FeatureGuard>
              </TabsList>

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
        </main>
      </div>
    </div>
  );
};

export default Financial;
