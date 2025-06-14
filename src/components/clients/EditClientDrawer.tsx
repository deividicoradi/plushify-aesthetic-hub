
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { User, Mail, Phone, UserCheck, X, Save } from "lucide-react";

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
        title: "Campo obrigatório",
        description: "O nome do cliente é obrigatório",
        variant: "destructive",
      });
      return;
    }

    // Check if user is logged in
    if (!user || !client) {
      toast({
        title: "Erro de autenticação",
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
        title: "Cliente atualizado!",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-lg mx-auto w-full max-h-[90vh] overflow-hidden">
        {/* Modern Header with gradient */}
        <DrawerHeader className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 pb-6">
          <div className="absolute top-4 right-4">
            <DrawerClose asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-background/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          
          <div className="flex items-center gap-3 pr-12">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/10">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Editar Cliente
              </DrawerTitle>
              <DrawerDescription className="text-muted-foreground mt-1">
                Atualize as informações do cliente
              </DrawerDescription>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            <Badge 
              variant={form.status === "Ativo" ? "default" : "secondary"}
              className="text-xs px-3 py-1"
            >
              {form.status}
            </Badge>
          </div>
        </DrawerHeader>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form className="space-y-6 p-6" onSubmit={handleSubmit} autoComplete="off">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Nome *
              </Label>
              <Input 
                id="name" 
                name="name" 
                required 
                value={form.name} 
                onChange={handleInput}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                placeholder="Digite o nome completo"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleInput}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                placeholder="cliente@exemplo.com"
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Telefone
              </Label>
              <Input 
                id="phone" 
                name="phone" 
                value={form.phone} 
                onChange={handleInput} 
                placeholder="(11) 99999-9999"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                Status
              </Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Ativo
                    </div>
                  </SelectItem>
                  <SelectItem value="Inativo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Inativo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>

        {/* Modern Footer */}
        <DrawerFooter className="border-t border-border/50 bg-muted/20 p-6">
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 gap-2" 
              type="submit" 
              disabled={submitting}
              onClick={handleSubmit}
            >
              <Save className="w-4 h-4" />
              {submitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <DrawerClose asChild>
              <Button 
                variant="outline" 
                className="flex-1 hover:bg-accent/50 transition-all duration-200" 
                type="button"
              >
                Cancelar
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditClientDrawer;
