
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSidebar } from './layout/DashboardSidebar';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from "@/components/ui/sonner";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { tier, isSubscribed } = useSubscription();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            <DashboardSidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button 
              className="block md:hidden mr-4"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                Painel de Controle
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isSubscribed && (
              <div className="hidden sm:block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-plush-100 to-plush-200 text-plush-800">
                Plano {tier === 'starter' ? 'Starter' : tier === 'pro' ? 'Pro' : 'Premium'}
              </div>
            )}
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
