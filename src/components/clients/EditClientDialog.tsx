import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useClientFormState } from '@/hooks/clients/useClientFormState';
import { validateClientForm } from '@/utils/clientFormat';
import { ClientFormFields } from './ClientFormFields';

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  cep: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  payment_method: string | null;
  status: string;
};

type EditClientDialogProps = {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const EditClientDialog: React.FC<EditClientDialogProps> = ({ client, open, onOpenChange, onSuccess }) => {
  const { user } = useAuth();
  const { form, setForm, handleInput, searchCep, loadingCep } = useClientFormState(client);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateClientForm(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!user || !client) {
      toast.error("Você precisa estar logado para editar um cliente");
      return;
    }

    setSubmitting(true);

    try {
      const updateData = {
        name: form.name.trim(),
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
        cpf: form.cpf.trim(),
        cep: form.cep?.trim() || null,
        address: form.address?.trim() || null,
        neighborhood: form.neighborhood?.trim() || null,
        city: form.city?.trim() || null,
        state: form.state?.trim() || null,
        payment_method: form.payment_method || null,
        status: form.status,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', client.id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        if (error.code === '23505') {
          if (error.message.includes('cpf')) {
            toast.error("CPF já cadastrado no sistema");
          } else if (error.message.includes('email')) {
            toast.error("Email já cadastrado no sistema");
          } else {
            toast.error("Dados duplicados encontrados");
          }
          return;
        }
        throw error;
      }

      if (!result || result.length === 0) {
        toast.error("Não foi possível atualizar. Verifique se o cliente ainda existe.");
        return;
      }

      toast.success("Cliente atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao atualizar cliente: " + (error.message || 'Erro desconhecido'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Editar Cliente</DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  Atualize as informações do cliente
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant={form.status === "Ativo" ? "default" : "secondary"}
              className="text-xs px-3 py-1"
            >
              {form.status}
            </Badge>
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
            <Button type="submit" disabled={submitting} className="gap-2">
              <Save className="w-4 h-4" />
              {submitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
