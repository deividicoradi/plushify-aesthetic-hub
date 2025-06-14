
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter, Check } from "lucide-react";
import React from "react";

type Props = {
  filters: {
    status: string;
    lastVisit: string;
  };
  setFilters: (f: { status: string; lastVisit: string }) => void;
};

const statuses = ["Todos", "Ativo", "Inativo"];
const visits = ["Todos", "Hoje", "Últimos 7 dias", "Últimos 30 dias"];

const ClientFiltersPopover: React.FC<Props> = ({ filters, setFilters }) => {
  const hasActiveFilters = filters.status !== "Todos" || filters.lastVisit !== "Todos";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 relative transition-all duration-200 ${
            hasActiveFilters 
              ? "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10" 
              : "hover:bg-accent/50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 bg-background/95 backdrop-blur-md border-border/50 shadow-xl z-50"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Status do Cliente</h4>
              {filters.status !== "Todos" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setFilters({ ...filters, status: "Todos" })}
                >
                  Limpar
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {statuses.map((status) => (
                <Button
                  size="sm"
                  key={status}
                  variant={filters.status === status ? "default" : "outline"}
                  className={`relative h-9 text-xs transition-all duration-200 ${
                    filters.status === status
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                      : "hover:bg-accent/50 hover:border-primary/30"
                  }`}
                  onClick={() => setFilters({ ...filters, status })}
                >
                  {filters.status === status && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Última Visita</h4>
              {filters.lastVisit !== "Todos" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setFilters({ ...filters, lastVisit: "Todos" })}
                >
                  Limpar
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {visits.map((visit) => (
                <Button
                  size="sm"
                  key={visit}
                  variant={filters.lastVisit === visit ? "default" : "outline"}
                  className={`relative h-9 text-xs transition-all duration-200 ${
                    filters.lastVisit === visit
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                      : "hover:bg-accent/50 hover:border-primary/30"
                  }`}
                  onClick={() => setFilters({ ...filters, lastVisit: visit })}
                >
                  {filters.lastVisit === visit && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {visit}
                </Button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="pt-3 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                onClick={() => setFilters({ status: "Todos", lastVisit: "Todos" })}
              >
                Limpar Todos os Filtros
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ClientFiltersPopover;
