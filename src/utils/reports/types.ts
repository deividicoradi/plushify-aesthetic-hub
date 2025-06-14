
export interface ReportData {
  payments: any[];
  installments: any[];
  expenses: any[];
  cashClosures: any[];
  period: {
    from: string;
    to: string;
  };
}
