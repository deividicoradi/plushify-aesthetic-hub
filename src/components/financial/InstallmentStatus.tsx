
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface InstallmentStatusProps {
  status: string;
  dueDate: string;
}

const InstallmentStatus = ({ status, dueDate }: InstallmentStatusProps) => {
  const isOverdue = new Date(dueDate) < new Date() && status === 'pendente';
  
  const statusConfig = {
    pendente: { 
      label: isOverdue ? 'Atrasado' : 'Pendente', 
      variant: isOverdue ? 'destructive' as const : 'secondary' as const,
      icon: isOverdue ? AlertTriangle : Clock
    },
    pago: { label: 'Pago', variant: 'default' as const, icon: CheckCircle },
    cancelado: { label: 'Cancelado', variant: 'outline' as const, icon: Clock },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export default InstallmentStatus;
