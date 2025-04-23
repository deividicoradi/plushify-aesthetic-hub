
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 bg-background z-50 border animate-fade-in"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">Status</div>
            <div className="flex gap-2">
              {statuses.map((status) => (
                <Button
                  size="sm"
                  key={status}
                  variant={filters.status === status ? "default" : "outline"}
                  className={filters.status === status
                    ? "bg-pink-500 text-white hover:bg-pink-600"
                    : ""}
                  onClick={() => setFilters({ ...filters, status })}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">Última visita</div>
            <div className="flex flex-wrap gap-2">
              {visits.map((visit) => (
                <Button
                  size="sm"
                  key={visit}
                  variant={filters.lastVisit === visit ? "default" : "outline"}
                  className={filters.lastVisit === visit
                    ? "bg-pink-500 text-white hover:bg-pink-600"
                    : ""}
                  onClick={() => setFilters({ ...filters, lastVisit: visit })}
                >
                  {visit}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ClientFiltersPopover;

