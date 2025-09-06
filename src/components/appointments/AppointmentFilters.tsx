
import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface AppointmentFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AppointmentFilters = ({ open, onOpenChange }: AppointmentFiltersProps) => {
  const [filters, setFilters] = useState({
    status: '',
    service: '',
    dateRange: '',
    client: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      service: '',
      dateRange: '',
      client: ''
    });
  };

  const applyFilters = () => {
    // Here you would apply the filters to the appointments list
    console.log('Applying filters:', filters);
    onOpenChange(false);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Agendamentos
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service Filter */}
          <div className="space-y-2">
            <Label>Serviço</Label>
            <Select value={filters.service} onValueChange={(value) => handleFilterChange('service', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                <SelectItem value="corte-escova">Corte e Escova</SelectItem>
                <SelectItem value="manicure">Manicure</SelectItem>
                <SelectItem value="massagem">Massagem Relaxante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os períodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="tomorrow">Amanhã</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Filter */}
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={filters.client} onValueChange={(value) => handleFilterChange('client', value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                <SelectItem value="maria-silva">Maria Silva</SelectItem>
                <SelectItem value="ana-costa">Ana Costa</SelectItem>
                <SelectItem value="julia-santos">Julia Santos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="space-y-2">
              <Label>Filtros ativos</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <Badge key={key} variant="outline" className="flex items-center gap-1">
                      {value}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleFilterChange(key, '')}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Limpar
            </Button>
            <Button onClick={applyFilters} className="flex-1 bg-plush-600 hover:bg-plush-700">
              Aplicar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
