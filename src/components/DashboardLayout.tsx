
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Anotações', path: '/notes' },
    { name: 'Agendamentos', path: '/agendamentos' },
    { name: 'Clientes', path: '/clientes' },
    { name: 'Comunicação', path: '/comunicacao' },
    { name: 'Inventário', path: '/estoque' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-plush-600"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <img src="/logo.svg" alt="Plushify" className="h-8" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium hidden sm:block">
            {user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" />
            Sair
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 border-r bg-white">
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                className="justify-start mb-1"
                onClick={() => navigate(link.path)}
              >
                {link.name}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <aside className="fixed inset-0 top-16 z-40 w-64 bg-white border-r lg:hidden">
            <nav className="flex flex-col p-4">
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  variant="ghost"
                  className="justify-start mb-1"
                  onClick={() => {
                    navigate(link.path);
                    setSidebarOpen(false);
                  }}
                >
                  {link.name}
                </Button>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
