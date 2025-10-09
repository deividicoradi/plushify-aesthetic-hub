
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
      // Use secure RPC function for SELECT with audit logging
      const { data, error } = await supabase.rpc('get_clients_masked', {
        p_mask_sensitive: false
      });

      if (error) throw error;
      
      // Map to only id and name for dropdown
      return (data || []).map((client: any) => ({
        id: client.id,
        name: client.name
      }));
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
