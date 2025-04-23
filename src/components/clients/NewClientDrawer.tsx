
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

type NewClientDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NewClientDrawer: React.FC<NewClientDrawerProps> = ({ open, onOpenChange }) => {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Aqui você enviaria os dados para o backend.
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);
    }, 1100);
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
            <Input id="name" name="name" required value={form.name} onChange={handleInput}/>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required value={form.email} onChange={handleInput}/>
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" required value={form.phone} onChange={handleInput} placeholder="(99) 99999-9999"/>
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
            <Button className="w-full bg-pink-500 hover:bg-pink-600" type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar Cliente"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" type="button">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default NewClientDrawer;
