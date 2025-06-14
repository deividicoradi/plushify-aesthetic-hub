
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from 'lucide-react';

const PaymentsEmptyState = () => {
  return (
    <Card className="text-center py-8">
      <CardContent>
        <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
        <p className="text-gray-500">Comece criando seu primeiro pagamento.</p>
      </CardContent>
    </Card>
  );
};

export default PaymentsEmptyState;
