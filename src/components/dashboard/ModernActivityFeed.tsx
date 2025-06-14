
import React from 'react';
import { User, Calendar, Receipt, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    type: 'client',
    icon: User,
    title: 'Novo cliente premium',
    description: 'Maria Silva completou cadastro',
    time: '5 min',
    status: 'success',
    avatar: 'MS',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    type: 'appointment',
    icon: Calendar,
    title: 'Agendamento confirmado',
    description: 'João Santos - Corte e Barba',
    time: '1h',
    status: 'confirmed',
    avatar: 'JS',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    type: 'payment',
    icon: Receipt,
    title: 'Pagamento recebido',
    description: 'R$ 150,00 - Pacote Completo',
    time: '2h',
    status: 'completed',
    avatar: '💰',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 4,
    type: 'growth',
    icon: TrendingUp,
    title: 'Meta mensal atingida',
    description: '105% da meta de faturamento',
    time: '3h',
    status: 'achievement',
    avatar: '🎯',
    color: 'from-orange-500 to-orange-600'
  }
];

export const ModernActivityFeed = () => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'achievement': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleViewAllActivities = () => {
    // Por enquanto vamos navegar para a página de relatórios que seria onde ficaria o histórico completo
    // No futuro pode ser criada uma página específica para atividades
    navigate('/reports');
  };

  const handleViewDetails = (activity: any) => {
    // Navegar para a página específica baseada no tipo de atividade
    switch (activity.type) {
      case 'client':
        navigate('/clients');
        break;
      case 'appointment':
        navigate('/appointments');
        break;
      case 'payment':
        navigate('/financial');
        break;
      case 'growth':
        navigate('/reports');
        break;
      default:
        break;
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              Atividade Recente
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Últimas movimentações em tempo real</p>
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ao vivo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="group relative">
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-16 bg-gradient-to-b from-border to-transparent" />
              )}
              
              <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-muted/50 hover:scale-[1.02] hover:shadow-md">
                {/* Avatar with gradient background */}
                <div className={`relative flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${activity.color} p-0.5`}>
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-sm font-medium">
                        {activity.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm truncate">{activity.title}</h4>
                    <Badge variant="outline" className={getStatusColor(activity.status)}>
                      {activity.time}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  
                  {/* Interactive elements */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      className="text-xs text-primary hover:underline"
                      onClick={() => handleViewDetails(activity)}
                    >
                      Ver detalhes
                    </button>
                    <span className="text-xs text-muted-foreground">•</span>
                    <button className="text-xs text-muted-foreground hover:text-foreground">Marcar como lido</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <button 
            className="w-full p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-200 text-primary font-medium text-sm group"
            onClick={handleViewAllActivities}
          >
            Ver todas as atividades
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
