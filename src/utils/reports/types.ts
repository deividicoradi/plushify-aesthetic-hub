
export interface Payment {
  id: string;
  description: string;
  amount: number;
  paid_amount?: number;
  status: string;
  created_at: string;
  payment_date?: string;
  clients?: {
    name: string;
  };
  payment_methods?: {
    name: string;
    type: string;
  };
  _deleted?: boolean;
  _deleted_at?: string;
  _deleted_reason?: string;
}

export interface Installment {
  id: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  paid_amount: number;
  due_date: string;
  payment_date?: string;
  status: string;
  payments?: {
    description: string;
    payment_methods?: {
      name: string;
    };
  };
}

export interface ReportData {
  payments: Payment[];
  installments: Installment[];
  expenses: any[];
  cashClosures: any[];
  period: {
    from: string;
    to: string;
  };
}
