
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserX } from 'lucide-react';
import InstallmentCard from '../InstallmentCard';

interface InstallmentsNoClientProps {
  installments: any[];
  onEdit: (installment: any) => void;
  onUpdate: () => void;
}

const InstallmentsNoClient = ({ installments, onEdit, onUpdate }: InstallmentsNoClientProps) => {
  const totalAmount = installments.reduce((sum, installment) => sum + Number(installment.amount), 0);
  const paidAmount = installments.reduce((sum, installment) => sum + Number(installment.paid_amount || 0), 0);
  const pendingCount = installments.filter(inst => inst.status === 'pendente').length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center flex-shrink-0">
              <UserX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Sem Cliente Definido</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Parcelamentos sem cliente associado
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {installments.length} parcela(s)
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
          {installments.map((installment: any) => (
            <InstallmentCard
              key={installment.id}
              installment={installment}
              paymentData={installment.payment}
              onEdit={onEdit}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallmentsNoClient;
