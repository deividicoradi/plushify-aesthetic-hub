
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Package,
  Wrench,
  Heart,
  CreditCard,
  TrendingUp,
  Crown,
  PieChart,
  ChevronsLeft,
  ChevronsRight,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { hasFeature, loading: planLoading } = usePlanLimits();
  const { collapsed, toggle } = useSidebarCollapsed();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Agendamentos', path: '/appointments' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: Wrench, label: 'Serviços', path: '/services' },
    { icon: Package, label: 'Estoque', path: '/inventory' },
    { icon: CreditCard, label: 'Financeiro', path: '/financial' },
    { icon: PieChart, label: 'Painel Financeiro', path: '/financial-dashboard' },
    { icon: TrendingUp, label: 'Analytics Avançado', path: '/analytics', requiresFeature: 'hasAdvancedAnalytics' as const },
    { icon: Heart, label: 'Fidelidade', path: '/loyalty', requiresFeature: 'hasLoyaltyProgram' as const },
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-30 h-screen bg-background border-r border-border shadow-sm hidden md:block transition-[width] duration-200 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Logo + botão de recolher */}
      <div className={cn(
        "flex items-center border-b border-border bg-background",
        collapsed ? "justify-center p-4" : "justify-between p-6"
      )}>
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center min-w-0">
            <Logo size="lg" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const showLock = item.requiresFeature && !planLoading && !hasFeature(item.requiresFeature);

            const link = (
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  collapsed ? "justify-center" : "space-x-3",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-colors flex-shrink-0",
                  isActive ? "text-primary-foreground" : "group-hover:text-accent-foreground"
                )}
                aria-hidden="true"
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && showLock && (
                  <Crown
                    className="h-4 w-4 text-yellow-500 ml-auto flex-shrink-0"
                    aria-label="Recurso exclusivo de planos superiores"
                  />
                )}
                {collapsed && showLock && (
                  <Crown
                    className="h-3 w-3 text-yellow-500 absolute top-1 right-1"
                    aria-label="Recurso exclusivo de planos superiores"
                  />
                )}
              </Link>
            );

            return (
              <li key={item.path} className="relative">
                {collapsed ? (
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                ) : link}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer with Theme Toggle and Sign Out */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background space-y-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle />
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button
                  onClick={signOut}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Sair da conta"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <Button
              onClick={signOut}
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Sair da conta"
            >
              Sair
            </Button>
          </>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
