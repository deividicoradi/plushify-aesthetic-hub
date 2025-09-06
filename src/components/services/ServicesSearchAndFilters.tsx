import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface ServicesSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ServicesSearchAndFilters: React.FC<ServicesSearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços por nome, categoria ou descrição..."
          className="pl-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ServicesSearchAndFilters;