
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
  TrendingUp
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
    { icon: Wrench, label: 'Serviços', path: '/servicos' },
    { icon: Package, label: 'Estoque', path: '/inventory' },
    { icon: CreditCard, label: 'Financeiro', path: '/financial' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: TrendingUp, label: 'Analytics Avançado', path: '/analytics' },
    { icon: StickyNote, label: 'Anotações', path: '/anotacoes' },
    { icon: Heart, label: 'Fidelidade', path: '/fidelidade' },
    { icon: HelpCircle, label: 'Ajuda', path: '/help' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-bold text-foreground">Plushify</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle and Sign Out */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <Button 
          onClick={signOut}
          variant="ghost" 
          className="w-full text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          Sair
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
