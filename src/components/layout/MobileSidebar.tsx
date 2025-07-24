import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
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

  // Close sidebar when clicking outside or on a link
  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 w-80 h-full bg-background border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Menu principal móvel"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center" onClick={handleLinkClick}>
            <img 
              src="/logo-modern.svg" 
              alt="Plushify" 
              className="h-8 w-auto"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="touch-target"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 touch-target",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors flex-shrink-0",
                      isActive ? "text-primary-foreground" : ""
                    )} 
                    aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                    {item.premium && (
                      <Crown className="h-4 w-4 text-yellow-500 ml-auto flex-shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
          <Button 
            onClick={() => {
              signOut();
              onClose();
            }}
            variant="outline" 
            className="w-full justify-start touch-target"
            aria-label="Sair da conta"
          >
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
};