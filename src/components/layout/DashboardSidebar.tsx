
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Package,
  BarChart3,
  Wrench,
  StickyNote,
  Heart,
  HelpCircle,
  CreditCard,
  TrendingUp,
  Crown,
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Agendamentos', path: '/appointments' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: Wrench, label: 'Serviços', path: '/services' },
    { icon: Package, label: 'Estoque', path: '/inventory' },
    { icon: CreditCard, label: 'Financeiro', path: '/financial' },
    { icon: PieChart, label: 'Painel Financeiro', path: '/financial-dashboard' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: TrendingUp, label: 'Analytics Avançado', path: '/analytics', premium: true },
    { icon: StickyNote, label: 'Anotações', path: '/notes' },
    { icon: Heart, label: 'Fidelidade', path: '/loyalty' },
    { icon: Users, label: 'Equipe', path: '/team', premium: true },
    { icon: Crown, label: 'Planos', path: '/planos' },
    { icon: HelpCircle, label: 'Ajuda', path: '/help' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <aside 
      className="fixed top-0 left-0 z-30 w-64 h-screen bg-background border-r border-border shadow-sm"
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Logo */}
      <div className="flex items-center justify-start p-6 border-b border-border bg-background">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/logo-modern.svg" 
            alt="Plushify - Beauty Management Platform" 
            className="h-10 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 h-[calc(100vh-140px)]">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary-foreground" : "group-hover:text-accent-foreground"
                  )} 
                  aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer with Theme Toggle and Sign Out */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background space-y-2">
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
      </div>
    </aside>
  );
};

export default DashboardSidebar;
