
import React from 'react';

interface PaymentStatusAlertsProps {
  status: string;
  amount: string;
  paidAmount: string;
}

const PaymentStatusAlerts = ({ status, amount, paidAmount }: PaymentStatusAlertsProps) => {
  return (
    <>
      {status === 'pago' && (
        <div className="p-3 bg-green-50 dark:bg-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            💰 Este pagamento será automaticamente adicionado ao caixa quando salvo.
          </p>
        </div>
      )}

      {status === 'parcial' && amount && paidAmount && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            📝 Valor restante: R$ {(Number(amount) - Number(paidAmount)).toFixed(2)} será automaticamente registrado em Parcelamentos.
          </p>
        </div>
      )}
    </>
  );
};

export default PaymentStatusAlerts;
