
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Calculator, Receipt, TrendingUp } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import PaymentsTab from '@/components/financial/PaymentsTab';
import CashClosureTab from '@/components/financial/CashClosureTab';
import InstallmentsTab from '@/components/financial/InstallmentsTab';
import ExpensesTab from '@/components/financial/ExpensesTab';

const Financial = () => {
  const [activeTab, setActiveTab] = useState('payments');

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header with sidebar trigger */}
      <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie pagamentos, fechamento de caixa e parcelamentos
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="installments" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Parcelamentos</span>
            </TabsTrigger>
            <TabsTrigger value="cash-closure" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Fechamento</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Despesas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="installments" className="space-y-6">
            <InstallmentsTab />
          </TabsContent>

          <TabsContent value="cash-closure" className="space-y-6">
            <CashClosureTab />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpensesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Financial;
