
import React from "react";
import { Award, Star, BadgeCheck, Gift, Trophy } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // crie se não existir
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ReTooltip } from "recharts";

const pointsHistory = [
  { month: "Jan", points: 120 },
  { month: "Fev", points: 320 },
  { month: "Mar", points: 420 },
  { month: "Abr", points: 280 },
  { month: "Mai", points: 540 },
  { month: "Jun", points: 640 }
];

const rewards = [
  {
    name: "Máscara Facial Premium",
    required: 300,
    icon: <Gift className="w-6 h-6 text-accent2-600" />,
    description: "Experimente a nova máscara para revitalizar seu rosto."
  },
  {
    name: "Cashback R$30",
    required: 600,
    icon: <BadgeCheck className="w-6 h-6 text-vivid-purple" />,
    description: "R$30 de volta para usar em qualquer serviço Plushify."
  },
  {
    name: "Sessão VIP Relax",
    required: 1000,
    icon: <Trophy className="w-6 h-6 text-gold" />,
    description: "Agende e viva uma experiência de spa exclusiva!"
  }
];

const user = {
  name: "Juliana Andrade",
  currentPoints: 540,
  currentTier: "Ouro",
  photo: "/lovable-uploads/fb688682-304d-4260-8d0f-1e0b9ca400fe.png",
  nextReward: 600, // for progress bar
};

const benefitList = [
  { icon: <Star className="w-5 h-5 text-yellow-400" />, text: "Ganhe pontos por cada R$ gasto" },
  { icon: <Gift className="w-5 h-5 text-primary" />, text: "Troque pontos por prêmios e serviços exclusivos" },
  { icon: <BadgeCheck className="w-5 h-5 text-accent2-600" />, text: "Receba ofertas só para membros do clube" }
];

const goldGradient = "bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 text-gray-800";
const cardGlass = "backdrop-blur-lg bg-white/40 dark:bg-card/50 border-0 shadow-xl";

export default function Loyalty() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-purple/40 to-soft-gray/80 dark:from-plush-800 dark:to-zinc-950 py-12 px-3 animate-fade-in">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3 animate-fade-in">
          <Award className="w-9 h-9 text-plush-600 animate-float" />
          <h1 className="text-3xl md:text-4xl font-extrabold font-serif gradient-text tracking-tight">Clube de Fidelidade</h1>
        </div>

        {/* Usuário e pontos */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-5 items-center">
          <Card className={`${cardGlass} flex-shrink-0 w-full md:w-[340px] flex flex-col items-center py-7 relative`}>
            <img
              src={user.photo}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md -mt-12 bg-white/90"
            />
            <CardHeader className="items-center text-center pb-3 pt-1">
              <CardTitle className="text-xl font-serif text-plush-700">{user.name}</CardTitle>
              <CardDescription className="text-base mt-2">
                <span className={`inline-block px-2 py-1 rounded-lg font-bold uppercase ${goldGradient}`}>Cliente {user.currentTier}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2">
              <div className="text-center text-lg font-semibold text-charcoal-gray">
                <span className="text-3xl text-vivid-purple font-extrabold">{user.currentPoints}</span> pontos acumulados
              </div>
              <div className="w-full mt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Progress
                      value={(user.currentPoints / user.nextReward) * 100}
                      className="h-3 bg-soft-purple/60"
                    />
                  </TooltipTrigger>
                  <TooltipContent>Faltam <b>{user.nextReward - user.currentPoints}</b> pontos para desbloquear o próximo prêmio!</TooltipContent>
                </Tooltip>
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  Próxima recompensa disponível com <b>{user.nextReward}</b> pontos
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Gráfico de pontos */}
          <Card className={`${cardGlass} w-full flex-1 p-0`}>
            <CardHeader className="pb-2 pt-5 px-8">
              <CardTitle className="text-lg text-plush-700">Sua evolução de pontos</CardTitle>
              <CardDescription>Veja como você acumulou pontos nos últimos meses</CardDescription>
            </CardHeader>
            <CardContent className="pt-1 h-44 px-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pointsHistory}>
                  <defs>
                    <linearGradient id="colorPts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c53d7c" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#f9e8f3" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, 700]} />
                  <ReTooltip
                    contentStyle={{ borderRadius: 8, background: "#fff" }}
                    labelFormatter={str => `Mês: ${str}`}
                    formatter={(v: number) => [`${v} pts`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="points"
                    stroke="#c53d7c"
                    fill="url(#colorPts)"
                    strokeWidth={4}
                    dot={{ r: 5, fill: "#c53d7c" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Benefícios do clube */}
        <Card className={`${cardGlass} flex flex-col md:flex-row items-center gap-4 md:gap-12 py-5 px-6`}>
          <CardHeader className="pl-0 md:pl-2">
            <CardTitle className="text-lg font-serif">Por que ser PlushiClub?</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">Vantagens exclusivas para membros do clube:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              {benefitList.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>{b.icon}</span>
                  <span className="font-semibold">{b.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loja de recompensas */}
        <Card className={`${cardGlass} py-6 px-7`}>
          <CardHeader>
            <CardTitle className="text-lg font-serif text-plush-700 flex items-center gap-2">
              <Gift className="w-6 h-6 text-vivid-purple" /> Loja de Recompensas
            </CardTitle>
            <CardDescription>Troque seus pontos por experiências premium!</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
              {rewards.map((reward, idx) => (
                <li key={reward.name} className="rounded-2xl bg-gradient-to-br from-soft-purple/40 to-white/50 dark:from-plush-900/30 dark:to-card/60 shadow-md p-5 flex flex-col items-center gap-2 border hover:scale-105 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    {reward.icon}
                    <span className="font-bold text-base">{reward.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground min-h-[32px] text-center">{reward.description}</div>
                  <div className="relative w-full mt-4">
                    {user.currentPoints >= reward.required ? (
                      <Button className="w-full bg-vivid-purple text-white rounded-full" variant="default">
                        Resgatar por {reward.required} pts
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        Faltam {reward.required - user.currentPoints} pts
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="text-center mt-4 text-muted-foreground text-sm opacity-80">
          Powered by Plushify Club <Award className="inline w-4 h-4 ml-1 text-plush-600" />
        </div>
      </div>
    </div>
  );
}

/**
 * Cores Tailwind customizadas referenciadas:
 * - bg-soft-purple: #E5DEFF
 * - bg-soft-gray: #F1F0FB
 * - text-vivid-purple: #8B5CF6
 * - text-gold: #facc15
 * - text-charcoal-gray: #403E43
 * Se não existirem no seu Tailwind, substitua por equivalentes.
 */
