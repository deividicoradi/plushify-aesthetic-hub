
import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    name: "Maria Silva",
    business: "Estúdio Beleza & Arte",
    text: "Com o plano Enterprise, aumentei meu faturamento em 150% em 6 meses!",
    plan: "Enterprise"
  },
  {
    name: "João Santos",
    business: "Clínica Renovar",
    text: "O dashboard executivo me dá insights que transformaram meu negócio.",
    plan: "Enterprise"
  }
];

export const TestimonialsSection: React.FC = () => {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold">
            O que nossos clientes Enterprise estão dizendo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="italic">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {testimonial.plan}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
