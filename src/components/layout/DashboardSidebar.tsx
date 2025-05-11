
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  MessageSquare,
  Package,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  Bell,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  requiredTier?: 'free' | 'starter' | 'pro' | 'premium';
  badge?: string;
};

const DashboardSidebar = ({ collapsed = false, setCollapsed }: { collapsed?: boolean, setCollapsed?: (value: boolean) => void }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { tier, isSubscribed } = useSubscription();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Agendamentos', path: '/agendamentos', icon: CalendarDays },
    { name: 'Comunicação', path: '/comunicacao', icon: MessageSquare, requiredTier: 'starter' },
    { name: 'Inventário', path: '/estoque', icon: Package, requiredTier: 'pro' },
    { name: 'Anotações', path: '/notes', icon: FileText },
    { name: 'Fidelidade', path: '/fidelidade', icon: Bell, requiredTier: 'premium', badge: 'Novo' },
    { name: 'Financeiro', path: '/financeiro', icon: CreditCard, requiredTier: 'pro' },
    { name: 'Planos', path: '/planos', icon: CreditCard },
  ];

  const isFeatureAvailable = (requiredTier?: 'free' | 'starter' | 'pro' | 'premium') => {
    if (!requiredTier) return true;
    if (!isSubscribed) return requiredTier === 'free';
    
    const tierLevels = {
      'free': 0,
      'starter': 1,
      'pro': 2,
      'premium': 3
    };
    
    return tierLevels[tier as keyof typeof tierLevels] >= tierLevels[requiredTier];
  };

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-100 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center justify-between h-16 border-b border-gray-100 px-4">
        <Link to="/dashboard" className="flex items-center">
          {collapsed ? (
            <img src="/logo.svg" alt="Plushify" className="h-8 w-8" />
          ) : (
            <img src="/logo.svg" alt="Plushify" className="h-8" />
          )}
        </Link>
        <button 
          onClick={() => setCollapsed && setCollapsed(!collapsed)} 
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>
      
      <div className="py-4">
        <div className={cn(
          "flex flex-col gap-1 px-2",
          collapsed ? "items-center" : ""
        )}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const available = isFeatureAvailable(item.requiredTier);
            
            return (
              <Tooltip key={item.path} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link
                    to={available ? item.path : "#"}
                    onClick={(e) => !available && e.preventDefault()}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 transition-colors relative",
                      isActive ? "bg-plush-50 text-plush-700" : "hover:bg-gray-50",
                      !available && "opacity-50 cursor-not-allowed",
                      collapsed && "justify-center"
                    )}
                  >
                    <item.icon size={20} />
                    {!collapsed && (
                      <>
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge className="ml-auto bg-plush-500" variant="secondary">{item.badge}</Badge>
                        )}
                      </>
                    )}
                  </Link>
                </TooltipTrigger>
                {(collapsed || !available) && (
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                    {!available && (
                      <p className="text-xs text-gray-500">
                        Disponível no plano {item.requiredTier === 'starter' ? 'Starter' : 
                                           item.requiredTier === 'pro' ? 'Pro' : 'Premium'}
                      </p>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
        
        <div className="mt-auto pt-4 px-2">
          <div className="border-t border-gray-200 pt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to="/settings" 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors",
                    collapsed && "justify-center"
                  )}
                >
                  <Settings size={20} />
                  {!collapsed && <span>Configurações</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Configurações</TooltipContent>}
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to="/help" 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors",
                    collapsed && "justify-center"
                  )}
                >
                  <HelpCircle size={20} />
                  {!collapsed && <span>Ajuda</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Ajuda</TooltipContent>}
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={signOut}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors w-full text-left",
                    collapsed && "justify-center"
                  )}
                >
                  <LogOut size={20} />
                  {!collapsed && <span>Sair</span>}
                </button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Sair</TooltipContent>}
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
