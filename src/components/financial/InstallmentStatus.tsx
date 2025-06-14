
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
      variant: 'secondary' as const,
      className: isOverdue ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-red-500 text-white hover:bg-red-600',
      icon: isOverdue ? AlertTriangle : Clock
    },
    pago: { 
      label: 'Pago', 
      variant: 'default' as const, 
      className: 'bg-green-500 text-white hover:bg-green-600',
      icon: CheckCircle 
    },
    parcial: { 
      label: 'Parcial', 
      variant: 'outline' as const,
      className: 'bg-orange-500 text-white hover:bg-orange-600 border-orange-500',
      icon: Clock 
    },
    cancelado: { 
      label: 'Cancelado', 
      variant: 'outline' as const, 
      className: 'bg-gray-500 text-white hover:bg-gray-600',
      icon: Clock 
    },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export default InstallmentStatus;
