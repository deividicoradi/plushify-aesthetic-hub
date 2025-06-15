
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
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Desafios e Metas
        </CardTitle>
        <CardDescription>Complete desafios para ganhar pontos extras e recompensas especiais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <p className="text-xs text-muted-foreground">
            🎯 Complete desafios para subir de nível mais rápido!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
