
import React from 'react';
import { Target, Users, Calendar, DollarSign, CheckCircle, Clock, Star } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useChallenges } from '@/hooks/useChallenges';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'visits': return <Calendar className="w-4 h-4" />;
    case 'spending': return <DollarSign className="w-4 h-4" />;
    case 'referral': return <Users className="w-4 h-4" />;
    default: return <Target className="w-4 h-4" />;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100/80 text-green-700 dark:bg-green-900/80 dark:text-green-300';
    case 'medium': return 'bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-300';
    case 'hard': return 'bg-red-100/80 text-red-700 dark:bg-red-900/80 dark:text-red-300';
    default: return 'bg-gray-100/80 text-gray-700 dark:bg-gray-900/80 dark:text-gray-300';
  }
};

export const ChallengesCard: React.FC = () => {
  const { challenges, loading } = useChallenges();

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Desafios e Metas
          </CardTitle>
          <CardDescription>Complete desafios para ganhar pontos extras e recompensas especiais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/30 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Desafios e Metas
        </CardTitle>
        <CardDescription>Complete desafios para ganhar pontos extras e recompensas especiais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => (
          <div key={challenge.id} className={`p-4 rounded-lg border border-border/50 ${challenge.completed ? 'bg-green-50/80 dark:bg-green-950/30 border-green-200/50 dark:border-green-800/30' : 'bg-muted/30 dark:bg-muted/20'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${challenge.completed ? 'bg-green-100/80 dark:bg-green-900/80' : 'bg-primary/10'}`}>
                  {challenge.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    getTypeIcon(challenge.type)
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{challenge.title}</h4>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                </div>
              </div>
              <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty === 'easy' ? 'Fácil' : challenge.difficulty === 'medium' ? 'Médio' : 'Difícil'}
              </Badge>
            </div>
            
            {!challenge.completed && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Progresso: {challenge.current}/{challenge.target}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Até {new Date(challenge.expiresAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <Progress value={(challenge.current / challenge.target) * 100} className="h-2" />
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-medium text-primary">{challenge.reward}</span>
              </div>
              {challenge.completed && (
                <Badge className="bg-green-100/80 text-green-700 dark:bg-green-900/80 dark:text-green-300 text-xs">
                  Concluído!
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">
            🎯 Complete desafios para subir de nível mais rápido!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
