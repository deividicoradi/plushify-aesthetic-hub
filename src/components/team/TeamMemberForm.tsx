import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { KeyRound } from 'lucide-react';
import { TeamMemberInput, TeamMember } from '@/hooks/useTeamMembers';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useStaffPin } from '@/hooks/team/useStaffPin';
import { STAFF_PERMISSIONS, STAFF_PERMISSION_LABELS, type StaffPermissionKey } from '@/contexts/StaffModeContext';
import { toast } from '@/hooks/use-toast';

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
      permissions: (member?.permissions as Record<string, boolean>) || {},
    }
  });

  const { hasFeature } = usePlanLimits();
  const { setPin, clearPin } = useStaffPin();
  const [pinInput, setPinInput] = useState('');
  const [pinSaving, setPinSaving] = useState(false);

  React.useEffect(() => {
    setPinInput('');
    if (member) {
      reset({
        name: member.name,
        email: member.email || '',
        phone: member.phone || '',
        role: member.role,
        status: (member.status as 'active' | 'inactive') || 'active',
        hire_date: member.hire_date || '',
        salary: member.salary || 0,
        permissions: (member.permissions as Record<string, boolean>) || {},
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
        permissions: {},
      });
    }
  }, [member, reset]);

  const selectedRole = watch('role');
  const selectedStatus = watch('status');
  const permissions = watch('permissions') || {};

  const togglePermission = (key: StaffPermissionKey, checked: boolean) => {
    setValue('permissions', { ...permissions, [key]: checked });
  };

  const handleSavePin = async () => {
    if (!member || pinInput.length < 4) return;
    setPinSaving(true);
    try {
      const { error } = await setPin(member.id, pinInput);
      if (error) {
        toast({ title: 'Erro ao definir PIN', description: error, variant: 'destructive' });
        return;
      }
      toast({ title: 'PIN definido com sucesso' });
      setPinInput('');
    } finally {
      setPinSaving(false);
    }
  };

  const handleClearPin = async () => {
    if (!member) return;
    setPinSaving(true);
    try {
      const { error } = await clearPin(member.id);
      if (error) {
        toast({ title: 'Erro ao remover PIN', description: error, variant: 'destructive' });
        return;
      }
      toast({ title: 'PIN removido' });
    } finally {
      setPinSaving(false);
    }
  };

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
      <DialogContent className="max-w-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {member ? 'Editar Membro' : 'Adicionar Novo Membro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
              <Label className="text-xs sm:text-sm">Cargo *</Label>
              <Select value={selectedRole} onValueChange={(value) => setValue('role', value)}>
                <SelectTrigger className="h-9 sm:h-10">
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
                <p className="text-xs sm:text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}>
                <SelectTrigger className="h-9 sm:h-10">
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
              <Label className="text-xs sm:text-sm">Data de Contratação</Label>
              <input
                id="team-member-hire-date"
                name="hire_date"
                type="date"
                value={watch('hire_date') || ''}
                onChange={(e) => setValue('hire_date', e.target.value)}
                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Salário</Label>
              <input
                id="team-member-salary"
                name="salary"
                type="number"
                step="0.01"
                min="0"
                value={watch('salary')?.toString() || ''}
                onChange={(e) => setValue('salary', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {hasFeature('hasStaffPinMode') && (
            <>
              <Separator />
              <div className="space-y-3">
                <div>
                  <Label className="text-xs sm:text-sm font-semibold">Permissões no Modo Funcionário</Label>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Controla o que aparece na interface quando este funcionário entra com o PIN dele num dispositivo compartilhado.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STAFF_PERMISSIONS.map((key) => (
                    <label key={key} className="flex items-center gap-2 text-xs sm:text-sm">
                      <Checkbox
                        checked={!!permissions[key]}
                        onCheckedChange={(checked) => togglePermission(key, checked === true)}
                      />
                      {STAFF_PERMISSION_LABELS[key]}
                    </label>
                  ))}
                </div>
              </div>

              {member && (
                <div className="space-y-2 rounded-md border p-3">
                  <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    PIN de acesso ao Modo Funcionário
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="4 a 6 dígitos"
                      className="sm:max-w-[160px]"
                    />
                    <Button type="button" size="sm" variant="outline" disabled={pinInput.length < 4 || pinSaving} onClick={handleSavePin}>
                      Definir PIN
                    </Button>
                    <Button type="button" size="sm" variant="ghost" disabled={pinSaving} onClick={handleClearPin}>
                      Remover PIN
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {loading ? 'Salvando...' : member ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};