import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import { cn } from '@/lib/utils';

export const AuthenticatedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-screen transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <DashboardSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <img 
          src="/logo-modern.svg" 
          alt="Plushify" 
          className="h-8 w-auto"
        />
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 ease-in-out",
        "lg:ml-64", // Desktop: always account for sidebar
        "pt-16 lg:pt-0" // Mobile: account for mobile header
      )}>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};