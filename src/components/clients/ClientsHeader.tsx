
import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from '@/components/ui/sidebar';

interface ClientsHeaderProps {
  onNewClientClick: () => void;
}

const ClientsHeader: React.FC<ClientsHeaderProps> = ({ onNewClientClick }) => {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-4 px-6 py-4">
        <SidebarTrigger className="hover:bg-accent/50 transition-colors" />
        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 ring-1 ring-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Clientes
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie sua base de clientes
                </p>
              </div>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
            onClick={onNewClientClick}
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ClientsHeader;
