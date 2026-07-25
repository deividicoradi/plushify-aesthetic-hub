import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useServices } from '@/hooks/useServices';
import { ServicePackage, ServicePackageInput } from '@/hooks/packages/useServicePackages';

interface ServicePackageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ServicePackageInput) => Promise<void>;
  servicePackage?: ServicePackage | null;
  loading?: boolean;
}

export const ServicePackageForm: React.FC<ServicePackageFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  servicePackage,
  loading = false,
}) => {
  const { services } = useServices();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ServicePackageInput>({
    defaultValues: {
      service_id: servicePackage?.service_id || '',
      name: servicePackage?.name || '',
      total_sessions: servicePackage?.total_sessions || 10,
      price: servicePackage?.price || 0,
      validity_days: servicePackage?.validity_days || 90,
      active: servicePackage?.active ?? true,
    },
  });

  useEffect(() => {
    if (servicePackage) {
      reset({
        service_id: servicePackage.service_id,
        name: servicePackage.name,
        total_sessions: servicePackage.total_sessions,
        price: servicePackage.price,
        validity_days: servicePackage.validity_days,
        active: servicePackage.active,
      });
    } else {
      reset({ service_id: '', name: '', total_sessions: 10, price: 0, validity_days: 90, active: true });
    }
  }, [servicePackage, reset]);

  const selectedServiceId = watch('service_id');

  const handleFormSubmit = async (data: ServicePackageInput) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {servicePackage ? 'Editar Modelo de Pacote' : 'Novo Modelo de Pacote'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            label="Nome do pacote"
            name="name"
            value={watch('name') || ''}
            onChange={(value) => setValue('name', value)}
            error={errors.name?.message}
            placeholder="Ex: 10x Depilação"
            required
          />

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Serviço *</Label>
            <Select value={selectedServiceId} onValueChange={(value) => setValue('service_id', value)}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Sessões *</Label>
              <input
                type="number"
                min="1"
                value={watch('total_sessions')?.toString() || ''}
                onChange={(e) => setValue('total_sessions', parseInt(e.target.value) || 1)}
                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Preço (R$) *</Label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={watch('price')?.toString() || ''}
                onChange={(e) => setValue('price', parseFloat(e.target.value) || 0)}
                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Validade (dias) *</Label>
              <input
                type="number"
                min="1"
                value={watch('validity_days')?.toString() || ''}
                onChange={(e) => setValue('validity_days', parseInt(e.target.value) || 1)}
                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs sm:text-sm">
            <Checkbox checked={!!watch('active')} onCheckedChange={(checked) => setValue('active', checked === true)} />
            Ativo (disponível para venda)
          </label>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !selectedServiceId} className="w-full sm:w-auto">
              {loading ? 'Salvando...' : servicePackage ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
