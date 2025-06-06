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
  Sun,
  Moon,
  Scissors,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "next-themes";

export default function DashboardSidebar() {
  const { hasFeature } = useSubscription();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

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
      title: "Serviços",
      url: "/servicos",
      icon: Scissors,
      isActive: isActive("/servicos"),
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
    <div className="flex flex-col h-full bg-background border-r border-border py-4">
      <div className="px-6 pb-6 flex justify-center">
        <NavLink to="/dashboard" className="flex items-center">
          <img src="/logo.svg" alt="Plushify Logo" className="w-38 h-38" />
        </NavLink>
      </div>

      {/* Theme Toggle */}
      <div className="px-6 pb-4 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors ${item.isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
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
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
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
