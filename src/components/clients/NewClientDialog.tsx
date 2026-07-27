import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useClientStats } from '@/hooks/useClientStats';
import { useClientFormState } from '@/hooks/clients/useClientFormState';
import { validateClientForm } from '@/utils/clientFormat';
import { ClientFormFields } from './ClientFormFields';

type NewClientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const NewClientDialog: React.FC<NewClientDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const { user } = useAuth();
  const { hasReachedLimit } = usePlanLimits();
  const { totalClients } = useClientStats();
  const { form, setForm, handleInput, searchCep, loadingCep, reset } = useClientFormState();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateClientForm(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para adicionar um cliente");
      return;
    }

    if (hasReachedLimit('clients', totalClients)) {
      toast.error("Limite de clientes atingido para seu plano atual");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          cpf: form.cpf,
          cep: form.cep || null,
          address: form.address || null,
          neighborhood: form.neighborhood || null,
          city: form.city || null,
          state: form.state || null,
          payment_method: form.payment_method || null,
          status: form.status,
          last_visit: null
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505' && error.message.includes('cpf')) {
          toast.error("CPF já cadastrado no sistema");
          return;
        }
        throw error;
      }

      toast.success("Cliente adicionado com sucesso!");
      reset();
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error("Erro ao adicionar cliente: " + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Novo Cliente</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Preencha os dados para adicionar um novo cliente
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ClientFormFields
            form={form}
            onInputChange={handleInput}
            onSelectChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
            onCepBlur={searchCep}
            loadingCep={loadingCep}
          />

          <div className="flex gap-3 justify-end pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientDialog;
