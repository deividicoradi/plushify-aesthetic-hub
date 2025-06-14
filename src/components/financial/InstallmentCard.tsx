
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User } from 'lucide-react';
import InstallmentStatus from './InstallmentStatus';
import InstallmentDetails from './InstallmentDetails';
import InstallmentActions from './InstallmentActions';

interface InstallmentCardProps {
  installment: any;
  paymentData: any;
  clientData?: any;
  onEdit: (installment: any) => void;
  onUpdate: () => void;
}

const InstallmentCard = ({ installment, paymentData, clientData, onEdit, onUpdate }: InstallmentCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {installment.installment_number}
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-sm">
                Parcela {installment.installment_number}/{installment.total_installments}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {paymentData?.description || 'Pagamento'}
              </p>
            </div>
          </div>
          <InstallmentStatus status={installment.status} dueDate={installment.due_date} />
        </div>

        {/* Informações do Cliente */}
        {clientData && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium">{clientData.name}</span>
            </div>
            {clientData.phone && (
              <p className="text-xs text-muted-foreground ml-5">{clientData.phone}</p>
            )}
          </div>
        )}

        <InstallmentDetails installment={installment} />

        <InstallmentActions 
          installment={installment}
          onEdit={onEdit}
          onUpdate={onUpdate}
        />
      </CardContent>
    </Card>
  );
};

export default InstallmentCard;
