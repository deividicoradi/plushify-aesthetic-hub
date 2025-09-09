
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentClientFieldsProps {
  clientId: string;
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PaymentClientFields = ({ clientId, onFieldChange, disabled = false }: PaymentClientFieldsProps) => {
  const { user } = useAuth();

  const { data: clients } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="client_id">Cliente (opcional)</Label>
      <Select value={clientId} onValueChange={(value) => onFieldChange('client_id', value)} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um cliente (opcional)" />
        </SelectTrigger>
        <SelectContent>
          {clients?.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaymentClientFields;
