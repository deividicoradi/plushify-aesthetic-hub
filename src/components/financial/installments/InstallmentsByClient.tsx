
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail } from 'lucide-react';
import InstallmentCard from '../InstallmentCard';

interface InstallmentsByClientProps {
  clientData: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    installments: any[];
  };
  onEdit: (installment: any) => void;
  onUpdate: () => void;
}

const InstallmentsByClient = ({ clientData, onEdit, onUpdate }: InstallmentsByClientProps) => {
  const totalAmount = clientData.installments.reduce((sum, installment) => sum + Number(installment.amount), 0);
  const paidAmount = clientData.installments.reduce((sum, installment) => sum + Number(installment.paid_amount || 0), 0);
  const pendingCount = clientData.installments.filter(inst => inst.status === 'pendente').length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{clientData.name}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                {clientData.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>{clientData.email}</span>
                  </div>
                )}
                {clientData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span>{clientData.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {clientData.installments.length} parcela(s)
            </div>
            {pendingCount > 0 && (
              <div className="text-sm text-orange-600">
                {pendingCount} pendente(s)
              </div>
            )}
            <div className="text-lg font-bold">
              R$ {totalAmount.toFixed(2)}
            </div>
            {paidAmount > 0 && (
              <div className="text-sm text-green-600">
                Pago: R$ {paidAmount.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientData.installments.map((installment: any) => (
            <InstallmentCard
              key={installment.id}
              installment={installment}
              paymentData={installment.payment}
              clientData={clientData}
              onEdit={onEdit}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallmentsByClient;
