
import React from 'react';
import { User, CalendarDays, Receipt } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const activities = [
  {
    id: 1,
    type: 'client',
    icon: User,
    title: 'Novo cliente cadastrado',
    description: 'Maria Silva completou seu cadastro',
    time: '5 minutos atrás',
    details: 'Cliente premium, primeira compra agendada.',
    actionText: 'Ver Cliente',
    action: () => window.location.assign('/clientes')
  },
  {
    id: 2,
    type: 'appointment',
    icon: CalendarDays,
    title: 'Agendamento confirmado',
    description: 'João Santos - Corte e Barba',
    time: '1 hora atrás',
    details: 'Serviço confirmado para 10:30.',
    actionText: 'Ver Agenda',
    action: () => window.location.assign('/agendamentos')
  },
  {
    id: 3,
    type: 'payment',
    icon: Receipt,
    title: 'Pagamento recebido',
    description: 'R$ 150,00 - Pacote Completo',
    time: '2 horas atrás',
    details: 'Pagamento via cartão. Ref: #1237',
    actionText: 'Ver Financeiro',
    action: () => window.location.assign('/planos')
  },
];

export const RecentActivity = () => {
  const handleActivityClick = (activity: typeof activities[number]) => {
    toast({
      title: activity.title,
      description: (
        <div>
          <div className="mb-2">{activity.details}</div>
          <Button size="sm" variant="secondary" onClick={activity.action}>
            {activity.actionText}
          </Button>
        </div>
      ),
      duration: 4000
    });
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <button
            key={activity.id}
            className="flex w-full items-start space-x-4 p-2 rounded-lg transition shadow-sm hover:shadow-md bg-transparent hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            onClick={() => handleActivityClick(activity)}
            tabIndex={0}
            type="button"
            aria-label={`Ver detalhes de "${activity.title}"`}
          >
            <div className="p-2 bg-gradient-to-br from-[#E5DEFF] to-[#fff] rounded-lg">
              <Icon className="w-4 h-4 text-plush-600" />
            </div>
            <div className="flex-1 space-y-1 text-left">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
