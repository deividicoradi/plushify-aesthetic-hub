
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InstallmentCard from '../InstallmentCard';

interface InstallmentGroupCardProps {
  group: {
    payment: any;
    client: any;
    installments: any[];
  };
  onEdit: (installment: any) => void;
  onUpdate: () => void;
}

const InstallmentGroupCard = ({ group, onEdit, onUpdate }: InstallmentGroupCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {group.payment?.description || 'Pagamento sem descrição'}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1 space-y-1">
              <p>Parcelas: {group.installments.length}x</p>
              <p>Método: {group.payment?.payment_methods?.name || 'N/A'}</p>
              {group.client && (
                <div className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded border">
                  <p className="font-medium text-sm">Cliente: {group.client.name}</p>
                  {group.client.email && (
                    <p className="text-xs text-muted-foreground">Email: {group.client.email}</p>
                  )}
                  {group.client.phone && (
                    <p className="text-xs text-muted-foreground">Telefone: {group.client.phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {group.installments.map((installment: any) => (
            <InstallmentCard
              key={installment.id}
              installment={installment}
              paymentData={group.payment}
              clientData={group.client}
              onEdit={onEdit}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallmentGroupCard;
