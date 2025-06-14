
import React from 'react';
import { Calendar } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Appointments = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header with sidebar trigger */}
            <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
              <SidebarTrigger />
              <div className="flex items-center justify-between flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-plush-600" />
                  <h1 className="text-2xl font-bold">Agendamentos</h1>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-6">
              <div className="text-center py-12">
                <h2 className="text-xl text-muted-foreground">Sistema de agendamentos será recriado</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  A funcionalidade de agendamentos foi removida e será implementada novamente do zero.
                </p>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Appointments;
