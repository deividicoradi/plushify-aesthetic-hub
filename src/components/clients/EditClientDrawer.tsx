
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
};

type EditClientDrawerProps = {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const EditClientDrawer: React.FC<EditClientDrawerProps> = ({ client, open, onOpenChange, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Ativo",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        status: client.status || "Ativo",
      });
    }
  }, [client]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate required fields
    if (!form.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    // Check if user is logged in
    if (!user || !client) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para editar um cliente",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          status: form.status
        })
        .eq('id', client.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente: " + error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-md ml-auto w-full animate-slide-in-right">
        <DrawerHeader>
          <DrawerTitle>Editar Cliente</DrawerTitle>
          <DrawerDescription>Atualize os dados do cliente.</DrawerDescription>
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
              {submitting ? "Salvando..." : "Salvar Alterações"}
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

export default EditClientDrawer;
