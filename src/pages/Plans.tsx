
import React from 'react';
import { DollarSign } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Plans = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header with sidebar trigger */}
            <header className="flex items-center gap-4 border-b border-border bg-background px-4 py-2">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">Planos</h1>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-8 bg-background dark:bg-background">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold">Planos</h1>
                </div>
                
                <div className="text-center py-20">
                  <h2 className="text-xl text-muted-foreground">
                    Página de planos em desenvolvimento
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Em breve você poderá assinar nossos planos premium
                  </p>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Plans;
