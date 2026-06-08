import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ServicesSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewClick?: () => void;
}

const ServicesSearchAndFilters: React.FC<ServicesSearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onNewClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços..."
          className="pl-10 h-11 sm:h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {onNewClick && (
        <Button 
          onClick={onNewClick} 
          className="gap-2 touch-target h-11 sm:h-10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Serviço</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      )}
    </div>
  );
};

export default ServicesSearchAndFilters;