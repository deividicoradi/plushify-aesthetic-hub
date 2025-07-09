import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TeamMemberInput, TeamMember } from '@/hooks/useTeamMembers';

interface TeamMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TeamMemberInput) => Promise<void>;
  member?: TeamMember | null;
  loading?: boolean;
}

const roleOptions = [
  { value: 'gerente', label: 'Gerente' },
  { value: 'especialista', label: 'Especialista' },
  { value: 'assistente', label: 'Assistente' },
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'estagiario', label: 'Estagiário' },
];

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

export const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  member,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TeamMemberInput>({
    defaultValues: {
      name: member?.name || '',
      email: member?.email || '',
      phone: member?.phone || '',
      role: member?.role || '',
      status: (member?.status as 'active' | 'inactive') || 'active',
      hire_date: member?.hire_date || '',
      salary: member?.salary || 0,
    }
  });

  React.useEffect(() => {
    if (member) {
      reset({
        name: member.name,
        email: member.email || '',
        phone: member.phone || '',
        role: member.role,
        status: (member.status as 'active' | 'inactive') || 'active',
        hire_date: member.hire_date || '',
        salary: member.salary || 0,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        role: '',
        status: 'active',
        hire_date: '',
        salary: 0,
      });
    }
  }, [member, reset]);

  const selectedRole = watch('role');
  const selectedStatus = watch('status');

  const handleFormSubmit = async (data: TeamMemberInput) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
      if (!member) {
        reset();
      }
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {member ? 'Editar Membro' : 'Adicionar Novo Membro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nome"
              name="name"
              value={watch('name') || ''}
              onChange={(value) => setValue('name', value)}
              error={errors.name?.message}
              placeholder="Nome completo"
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={watch('email') || ''}
              onChange={(value) => setValue('email', value)}
              error={errors.email?.message}
              placeholder="email@exemplo.com"
            />

            <FormField
              label="Telefone"
              name="phone"
              type="tel"
              value={watch('phone') || ''}
              onChange={(value) => setValue('phone', value)}
              error={errors.phone?.message}
              placeholder="(00) 00000-0000"
            />

            <div className="space-y-2">
              <Label>Cargo *</Label>
              <Select value={selectedRole} onValueChange={(value) => setValue('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data de Contratação</Label>
              <input
                type="date"
                value={watch('hire_date') || ''}
                onChange={(e) => setValue('hire_date', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Salário</Label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={watch('salary')?.toString() || ''}
                onChange={(e) => setValue('salary', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : member ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};