
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useClientStats } from '@/hooks/useClientStats';

type NewClientDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const NewClientDrawer: React.FC<NewClientDrawerProps> = ({ open, onOpenChange, onSuccess }) => {
  const { user } = useAuth();
  const { hasReachedLimit } = usePlanLimits();
  const { totalClients } = useClientStats();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Ativo",
  });
  const [submitting, setSubmitting] = useState(false);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate required fields
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.error("Você precisa estar logado para adicionar um cliente");
      return;
    }

    // Check plan limits
    if (hasReachedLimit('clients', totalClients)) {
      toast.error("Limite de clientes atingido para seu plano atual");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          status: form.status,
          last_visit: null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Cliente adicionado com sucesso!");
      
      // Reset form and close drawer
      setForm({
        name: "",
        email: "",
        phone: "",
        status: "Ativo"
      });
      onOpenChange(false);
      
      // Notify parent component about the success
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-md ml-auto w-full animate-slide-in-right">
        <DrawerHeader>
          <DrawerTitle>Novo Cliente</DrawerTitle>
          <DrawerDescription>Preencha os dados para adicionar um novo cliente.</DrawerDescription>
        </DrawerHeader>
        <form className="space-y-5 px-6 pb-6" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input 
              id="name" 
              name="name" 
              required 
              value={form.name} 
              onChange={handleInput}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleInput}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              name="phone" 
              value={form.phone} 
              onChange={handleInput} 
              placeholder="(99) 99999-9999"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              className="w-full h-10 border border-input rounded-md px-3 text-sm bg-background focus:outline-none"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          <DrawerFooter>
            <Button 
              className="w-full bg-pink-500 hover:bg-pink-600" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar Cliente"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" type="button">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default NewClientDrawer;
