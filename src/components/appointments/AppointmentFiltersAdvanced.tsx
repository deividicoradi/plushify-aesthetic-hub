import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface AppointmentFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  clientName?: string;
  serviceName?: string;
  timeFrom?: string;
  timeTo?: string;
}

interface AppointmentFiltersAdvancedProps {
  filters: AppointmentFilters;
  onFiltersChange: (filters: AppointmentFilters) => void;
  onClearFilters: () => void;
}

const STATUS_OPTIONS = [
  { value: 'agendado', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  { value: 'confirmado', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
  { value: 'concluido', label: 'Concluído', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
];

export const AppointmentFiltersAdvanced = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: AppointmentFiltersAdvancedProps) => {
  const [localFilters, setLocalFilters] = useState<AppointmentFilters>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof AppointmentFilters, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onClearFilters();
    setIsOpen(false);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  const getActiveFiltersDisplay = () => {
    const activeFilters = [];
    
    if (filters.dateFrom || filters.dateTo) {
      const fromDate = filters.dateFrom ? format(new Date(filters.dateFrom), 'dd/MM', { locale: ptBR }) : '';
      const toDate = filters.dateTo ? format(new Date(filters.dateTo), 'dd/MM', { locale: ptBR }) : '';
      
      if (fromDate && toDate) {
        activeFilters.push(`${fromDate} - ${toDate}`);
      } else if (fromDate) {
        activeFilters.push(`A partir de ${fromDate}`);
      } else if (toDate) {
        activeFilters.push(`Até ${toDate}`);
      }
    }
    
    if (filters.status) {
      const statusOption = STATUS_OPTIONS.find(s => s.value === filters.status);
      activeFilters.push(statusOption?.label || filters.status);
    }
    
    if (filters.clientName) {
      activeFilters.push(`Cliente: ${filters.clientName}`);
    }
    
    if (filters.serviceName) {
      activeFilters.push(`Serviço: ${filters.serviceName}`);
    }
    
    if (filters.timeFrom || filters.timeTo) {
      const timeRange = `${filters.timeFrom || '00:00'} - ${filters.timeTo || '23:59'}`;
      activeFilters.push(`Horário: ${timeRange}`);
    }
    
    return activeFilters;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const activeFiltersDisplay = getActiveFiltersDisplay();

  return (
    <div className="space-y-3">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Filtros Avançados</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            {/* Date Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <Label className="font-medium">Período</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">De</Label>
                  <Input
                    type="date"
                    value={localFilters.dateFrom || ''}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Até</Label>
                  <Input
                    type="date"
                    value={localFilters.dateTo || ''}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Time Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <Label className="font-medium">Horário</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">De</Label>
                  <Input
                    type="time"
                    value={localFilters.timeFrom || ''}
                    onChange={(e) => updateFilter('timeFrom', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Até</Label>
                  <Input
                    type="time"
                    value={localFilters.timeTo || ''}
                    onChange={(e) => updateFilter('timeTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <Label className="font-medium">Status</Label>
              </div>
              <Select value={localFilters.status || ''} onValueChange={(value) => updateFilter('status', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Name */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <Label className="font-medium">Cliente</Label>
              </div>
              <Input
                placeholder="Nome do cliente"
                value={localFilters.clientName || ''}
                onChange={(e) => updateFilter('clientName', e.target.value)}
              />
            </div>

            {/* Service Name */}
            <div className="space-y-3">
              <Label className="font-medium">Serviço</Label>
              <Input
                placeholder="Nome do serviço"
                value={localFilters.serviceName || ''}
                onChange={(e) => updateFilter('serviceName', e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={applyFilters} className="w-full">
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={clearAllFilters} className="w-full">
                Limpar Todos os Filtros
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters Display */}
      {activeFiltersDisplay.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFiltersDisplay.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {filter}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                onClick={() => {
                  // This would require more complex logic to remove specific filters
                  // For now, just clear all filters
                  clearAllFilters();
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};