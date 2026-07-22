
import React from 'react';
import { Star } from 'lucide-react';

const Testimonial = ({ 
  quote, 
  author, 
  role, 
  stars,
  callout 
}: { 
  quote: string; 
  author: string; 
  role: string; 
  stars: number;
  callout?: string;
}) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col h-full hover:shadow-md transition-shadow duration-300">
      <div className="flex space-x-1 mb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star 
            key={index} 
            className={`w-4 h-4 ${index < stars ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} 
          />
        ))}
      </div>
      
      {callout && (
        <div className="text-primary font-medium text-lg mb-3 font-serif">"{callout}"</div>
      )}
      
      <p className="text-muted-foreground text-sm flex-grow italic mb-4">"{quote}"</p>
      
      <div className="mt-auto pt-4 border-t border-border">
        <p className="font-medium text-foreground">{author}</p>
        <p className="text-muted-foreground text-sm">{role}</p>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const testimonials: { quote: string; author: string; role: string; stars: number; callout?: string }[] = [];

  if (testimonials.length === 0) {
    return (
      <section className="py-12 bg-gradient-to-b from-background to-muted/30" id="testimonials">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 font-serif text-foreground">
              Estamos no <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">início</span>
            </h2>
            <p className="text-muted-foreground">
              Seja um dos primeiros negócios a usar o Plushify e ajude a escrever
              as primeiras histórias de sucesso.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30" id="testimonials">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif text-foreground">
            Histórias de <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sucesso</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Veja como o Plushify está transformando a realidade de profissionais
            de estética em todo o Brasil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              stars={testimonial.stars}
              callout={testimonial.callout}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
