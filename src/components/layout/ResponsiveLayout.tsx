import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';
import DashboardSidebar from './DashboardSidebar';
import { MobileSidebar } from './MobileSidebar';
import { GlobalHeader } from './GlobalHeader';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  actions
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isMobile } = useResponsive();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && <DashboardSidebar />}
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className={cn(
        "min-h-screen flex flex-col",
        !isMobile && "ml-64"
      )}>
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-background px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="touch-target md:hidden"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              
              {/* Title and icon */}
              {(title || Icon) && (
                <div className="flex items-center gap-3">
                  {Icon && (
                    <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 ring-1 ring-primary/10 hidden sm:block">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {title && (
                      <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-sm text-muted-foreground hidden sm:block">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions and Global Header */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
              <GlobalHeader />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

