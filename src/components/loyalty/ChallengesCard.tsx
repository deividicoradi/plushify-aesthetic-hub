
import React from 'react';
import { Target } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useChallenges } from '@/hooks/useChallenges';
import { ChallengeItem } from './ChallengeItem';
import { LoadingChallenges } from './LoadingChallenges';

export const ChallengesCard: React.FC = () => {
  const { challenges, loading } = useChallenges();

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Desafios e Metas
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Complete desafios para ganhar pontos extras e recompensas especiais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        {loading ? (
          <LoadingChallenges />
        ) : (
          <>
            {challenges.map((challenge) => (
              <ChallengeItem key={challenge.id} challenge={challenge} />
            ))}
          </>
        )}
        
        <div className="pt-2 text-center">
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            🎯 Complete desafios para subir de nível mais rápido!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
