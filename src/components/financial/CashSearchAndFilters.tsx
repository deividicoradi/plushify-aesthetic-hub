import React from 'react';
import { Search, Calendar, FolderOpen, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CashSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    dateFrom: string;
    dateTo: string;
    type: string;
  };
  onFiltersChange: (filters: { dateFrom: string; dateTo: string; type: string; }) => void;
  onOpenCash?: () => void;
  onCloseCash?: () => void;
  canOpenCash?: boolean;
  canCloseCash?: boolean;
}

const CashSearchAndFilters: React.FC<CashSearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  onOpenCash,
  onCloseCash,
  canOpenCash,
  canCloseCash,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por observações..."
            className="pl-10 h-11 sm:h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {(onOpenCash || onCloseCash) && (
          <div className="flex gap-2 w-full justify-end">
            {onOpenCash && (
              <Button 
                onClick={onOpenCash} 
                className="gap-2 touch-target"
                disabled={!canOpenCash}
                variant={canOpenCash ? "default" : "secondary"}
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{canOpenCash ? 'Abrir Caixa' : 'Caixa Aberto'}</span>
                <span className="sm:hidden">{canOpenCash ? 'Abrir' : 'Aberto'}</span>
              </Button>
            )}
            {onCloseCash && (
              <Button 
                onClick={onCloseCash} 
                variant="outline" 
                className="gap-2 touch-target"
                disabled={!canCloseCash}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{canCloseCash ? 'Fechar Caixa' : 'Abra o Caixa'}</span>
                <span className="sm:hidden">{canCloseCash ? 'Fechar' : 'Abra'}</span>
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateFrom">Data Inicial</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dateTo">Data Final</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select value={filters.type} onValueChange={(value) => onFiltersChange({ ...filters, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="opening">Abertura</SelectItem>
              <SelectItem value="closure">Fechamento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CashSearchAndFilters;