
import React from 'react';
import { User, Calendar, DollarSign } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'client',
    icon: User,
    title: 'Novo cliente cadastrado',
    description: 'Maria Silva completou seu cadastro',
    time: '5 minutos atrás',
  },
  {
    id: 2,
    type: 'appointment',
    icon: Calendar,
    title: 'Agendamento confirmado',
    description: 'João Santos - Corte e Barba',
    time: '1 hora atrás',
  },
  {
    id: 3,
    type: 'payment',
    icon: DollarSign,
    title: 'Pagamento recebido',
    description: 'R$ 150,00 - Pacote Completo',
    time: '2 horas atrás',
  },
];

export const RecentActivity = () => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon;
        
        return (
          <div key={activity.id} className="flex items-start space-x-4">
            <div className="p-2 bg-plush-50 rounded-lg">
              <Icon className="w-4 h-4 text-plush-600" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
