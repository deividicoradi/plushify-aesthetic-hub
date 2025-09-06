
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import ClientFiltersPopover from './ClientFiltersPopover';

interface ClientsSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    status: string;
    lastVisit: string;
  };
  onFiltersChange: (filters: { status: string; lastVisit: string; }) => void;
}

const ClientsSearchAndFilters: React.FC<ClientsSearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes por nome, email ou telefone..."
          className="pl-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-3">
        <ClientFiltersPopover
          filters={filters}
          setFilters={onFiltersChange}
        />
      </div>
    </div>
  );
};

export default ClientsSearchAndFilters;
