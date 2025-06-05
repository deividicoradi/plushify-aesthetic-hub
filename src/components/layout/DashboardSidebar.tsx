
import React from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Package,
  MessageSquare,
  FileText,
  BarChart3,
  Megaphone,
  Brain,
  Zap,
  Heart,
  Settings as SettingsIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSubscription } from "@/hooks/useSubscription";

export default function DashboardSidebar() {
  const { hasFeature } = useSubscription();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: isActive("/dashboard"),
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: Users,
      isActive: isActive("/clientes"),
    },
    {
      title: "Agendamentos",
      url: "/agendamentos",
      icon: CalendarDays,
      isActive: isActive("/agendamentos"),
    },
    {
      title: "Estoque",
      url: "/estoque",
      icon: Package,
      isActive: isActive("/estoque"),
    },
    {
      title: "Comunicação",
      url: "/comunicacao",
      icon: MessageSquare,
      isActive: isActive("/comunicacao"),
    },
    ...(hasFeature('pro') ? [{
      title: "Marketing",
      url: "/marketing",
      icon: Megaphone,
      isActive: isActive("/marketing"),
      isPremium: true,
    }] : []),
    ...(hasFeature('premium') ? [
      {
        title: "Analytics IA",
        url: "/analytics",
        icon: Brain,
        isActive: isActive("/analytics"),
        isPremium: true,
      },
      {
        title: "Automações",
        url: "/automacoes",
        icon: Zap,
        isActive: isActive("/automacoes"),
        isPremium: true,
      }
    ] : []),
    {
      title: "Relatórios",
      url: "/relatorios",
      icon: BarChart3,
      isActive: isActive("/relatorios"),
    },
    {
      title: "Fidelidade",
      url: "/fidelidade",
      icon: Heart,
      isActive: isActive("/fidelidade"),
    },
    {
      title: "Anotações",
      url: "/anotacoes",
      icon: FileText,
      isActive: isActive("/anotacoes"),
    },
  ];

  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to home page after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const footerItems = [
    {
      title: "Configurações",
      url: "/configuracoes",
      icon: SettingsIcon,
      isActive: isActive("/configuracoes"),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r py-4">
      <div className="px-6 pb-6 flex justify-center">
        <NavLink to="/dashboard" className="flex items-center">
          <img src="/logo.svg" alt="Plushify Logo" className="w-32 h-32" />
        </NavLink>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors ${item.isActive ? 'bg-gray-100 text-plush-700' : 'text-gray-500'
              }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.title}</span>
            {item.isPremium && (
              <span className="ml-auto w-fit rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                IA
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="px-6 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-full rounded-md">
              <Avatar className="mr-2 h-6 w-6">
                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium leading-none">
                {user?.email || "Meu Perfil"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" forceMount className="w-40">
            {footerItems.map((item) => (
              <DropdownMenuItem key={item.title} asChild>
                <NavLink
                  to={item.url}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </NavLink>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
