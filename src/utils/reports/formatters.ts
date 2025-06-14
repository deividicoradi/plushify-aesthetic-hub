
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
};

export const formatDateTime = (date: Date) => {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};
