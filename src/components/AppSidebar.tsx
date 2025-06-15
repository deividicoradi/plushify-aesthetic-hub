
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  Package,
  FileText,
  Settings,
  CreditCard,
  TrendingUp,
  Book,
  HelpCircle,
  LucideIcon,
  LogOut,
  Crown
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

const NavItem = ({ icon: Icon, label, href }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild data-active={isActive}>
        <Link to={href} className="flex items-center gap-3 relative">
          <Icon className="w-4 h-4" />
          <span className="flex-1">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const AppSidebar = () => {
  const { user, signOut } = useAuth();

  const mainMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Clientes', href: '/clients' },
    { icon: Calendar, label: 'Agendamentos', href: '/appointments' },
    { icon: Briefcase, label: 'Serviços', href: '/services' },
    { icon: Package, label: 'Estoque', href: '/inventory' },
  ];

  const financialItems = [
    { icon: CreditCard, label: 'Financeiro', href: '/financial' },
    { icon: TrendingUp, label: 'Painel Financeiro', href: '/financial-dashboard' },
    { icon: FileText, label: 'Relatórios', href: '/reports' },
  ];

  const otherItems = [
    { icon: Book, label: 'Anotações', href: '/notes' },
    { icon: Crown, label: 'Planos', href: '/planos' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
    { icon: HelpCircle, label: 'Ajuda', href: '/help' },
  ];

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Plushify</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 mb-2">
            Financeiro
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {financialItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 mb-2">
            Outros
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {otherItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4 space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="flex-1 justify-start gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
