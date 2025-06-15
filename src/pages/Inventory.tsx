
import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

const Inventory = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            <header className="flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sticky top-0 z-50">
              <SidebarTrigger />
            </header>

            <main className="flex-1 bg-background overflow-hidden">
              <div className="p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
                <Card className="max-w-md w-full">
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      Funcionalidade Removida
                    </h2>
                    <p className="text-muted-foreground">
                      A funcionalidade de estoque foi removida do sistema conforme solicitado.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Inventory;
