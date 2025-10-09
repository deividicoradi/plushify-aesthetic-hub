import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, CreditCard, FileText, MapPin, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    payment_method: "",
    status: "Ativo",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        cpf: client.cpf || "",
        cep: client.cep || "",
        address: client.address || "",
        neighborhood: client.neighborhood || "",
        city: client.city || "",
        state: client.state || "",
        payment_method: client.payment_method || "",
        status: client.status || "Ativo",
      });
    }
  }, [client]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    
    // Format CPF input
    if (e.target.name === 'cpf') {
      value = value.replace(/\D/g, '').slice(0, 11);
    }
    
    // Format CEP input
    if (e.target.name === 'cep') {
      value = value.replace(/\D/g, '').slice(0, 8);
    }
    
    setForm({ ...form, [e.target.name]: value });
  }

  async function searchCep(cep: string) {
    if (cep.length !== 8) return;
    
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          address: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || ""
        }));
      } else {
        toast.error("CEP não encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  }

  function formatCpfDisplay(cpf: string) {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  }

  function formatCepDisplay(cep: string) {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate required fields
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!form.cpf.trim()) {
      toast.error("CPF é obrigatório");
      return;
    }

    if (form.cpf.length !== 11) {
      toast.error("CPF deve ter 11 dígitos");
      return;
    }

    // Check if user is logged in
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

      // Perform the update with user_id for RLS
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
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome *
                </Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  value={form.name} 
                  onChange={handleInput}
                  placeholder="Nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CPF *
                </Label>
                <Input 
                  id="cpf" 
                  name="cpf" 
                  required 
                  value={formatCpfDisplay(form.cpf)} 
                  onChange={handleInput}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleInput}
                  placeholder="cliente@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleInput} 
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input 
                  id="cep" 
                  name="cep" 
                  value={formatCepDisplay(form.cep)} 
                  onChange={handleInput}
                  onBlur={(e) => searchCep(e.target.value.replace(/\D/g, ''))}
                  placeholder="00000-000"
                  maxLength={9}
                  disabled={loadingCep}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Logradouro</Label>
                <Input 
                  id="address" 
                  name="address" 
                  value={form.address} 
                  onChange={handleInput}
                  placeholder="Rua, Avenida..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input 
                  id="neighborhood" 
                  name="neighborhood" 
                  value={form.neighborhood} 
                  onChange={handleInput}
                  placeholder="Bairro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={form.city} 
                  onChange={handleInput}
                  placeholder="Cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input 
                  id="state" 
                  name="state" 
                  value={form.state} 
                  onChange={handleInput}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Payment and Status Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pagamento e Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Forma de Pagamento Preferida</Label>
                <Select value={form.payment_method} onValueChange={(value) => setForm({ ...form, payment_method: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="gap-2"
            >
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