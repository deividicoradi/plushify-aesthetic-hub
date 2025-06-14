
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InstallmentPaymentSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  payments: any[];
}

const InstallmentPaymentSelect = ({ value, onValueChange, payments }: InstallmentPaymentSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="payment_id">Pagamento Base</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um pagamento" />
        </SelectTrigger>
        <SelectContent>
          {payments?.map((payment) => (
            <SelectItem key={payment.id} value={payment.id}>
              <div className="flex flex-col">
                <span className="font-medium">{payment.description}</span>
                <div className="text-sm text-muted-foreground">
                  R$ {Number(payment.amount).toFixed(2)}
                  {payment.clients && ` - ${payment.clients.name}`}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default InstallmentPaymentSelect;
