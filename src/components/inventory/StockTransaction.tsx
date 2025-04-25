
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type TransactionFormData = {
  quantity: number;
  notes?: string;
};

export const StockTransaction = ({ 
  productId, 
  type,
  onSuccess 
}: { 
  productId: string;
  type: "entrada" | "saida";
  onSuccess: () => void;
}) => {
  const { user } = useAuth();
  const form = useForm<TransactionFormData>({
    defaultValues: {
      quantity: 1,
      notes: ""
    }
  });

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const { error } = await supabase
        .from('inventory_transactions')
        .insert({
          product_id: productId,
          type,
          quantity: data.quantity,
          notes: data.notes,
          user_id: user?.id
        });

      if (error) throw error;

      toast.success(`${type === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(`Erro ao registrar ${type}: ` + error.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input {...field} type="number" min="1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Detalhes adicionais..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant={type === 'entrada' ? 'default' : 'destructive'}>
          Registrar {type === 'entrada' ? 'Entrada' : 'Saída'}
        </Button>
      </form>
    </Form>
  );
};
