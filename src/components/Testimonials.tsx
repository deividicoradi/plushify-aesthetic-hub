
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
    <div className="bg-white rounded-xl p-6 shadow-sm border border-plush-100 flex flex-col h-full card-hover">
      <div className="flex space-x-1 mb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star 
            key={index} 
            className={`w-4 h-4 ${index < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
          />
        ))}
      </div>
      
      {callout && (
        <div className="text-plush-600 font-medium text-lg mb-3 font-serif">"{callout}"</div>
      )}
      
      <p className="text-foreground/80 text-sm flex-grow italic">"{quote}"</p>
      
      <div className="mt-4 pt-4 border-t border-plush-50">
        <p className="font-medium">{author}</p>
        <p className="text-foreground/60 text-sm">{role}</p>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      quote: "O Plushify transformou completamente a minha rotina. Reduzi em 80% o tempo que eu gastava com agendamentos e consigo manter meus clientes muito mais engajados com as mensagens automáticas.",
      author: "Camila Oliveira",
      role: "Esteticista, São Paulo",
      stars: 5,
      callout: "Reduzi em 80% o tempo com agendamentos"
    },
    {
      quote: "Comecei a usar para organizar minha agenda, mas o controle de insumos e as dicas de marketing da IA foram um divisor de águas no meu negócio. Em 3 meses, aumentei meu faturamento em 40%.",
      author: "Rafael Mendes",
      role: "Proprietário de Clínica, Rio de Janeiro",
      stars: 5,
      callout: "Aumentei meu faturamento em 40%"
    },
    {
      quote: "O recurso de cursos e certificados me permitiu criar uma nova fonte de renda sem precisar sair do meu espaço. As automações de email e WhatsApp mantêm minhas turmas sempre cheias.",
      author: "Juliana Costa",
      role: "Especialista em Dermopigmentação, Belo Horizonte",
      stars: 5
    },
    {
      quote: "Como gerente de uma rede com 5 unidades, o Plushify me deu controle total sobre as operações. A visibilidade da performance de cada profissional e unidade é impressionante.",
      author: "Marcos Rocha",
      role: "Gerente de Rede de Estética, Brasília",
      stars: 5
    },
    {
      quote: "Vinha de outro sistema que era muito complicado. No Plushify, minha equipe aprendeu a usar em um dia! O suporte é excelente e as atualizações constantes sempre trazem melhorias úteis.",
      author: "Fernanda Lima",
      role: "Proprietária de Spa, Florianópolis",
      stars: 4
    },
    {
      quote: "A função de biolink e o programa de afiliados revolucionaram minha presença no Instagram. Consigo monetizar meus seguidores e converter muito mais visitas em clientes reais.",
      author: "Amanda Silva",
      role: "Influenciadora e Esteticista, Recife",
      stars: 5,
      callout: "Revolucionou minha presença no Instagram"
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-secondary/30" id="testimonials">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
            Histórias de <span className="gradient-text">Sucesso</span>
          </h2>
          <p className="text-lg text-foreground/70">
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
        
        <div className="mt-16 text-center">
          <div className="inline-block rounded-full bg-plush-50 border border-plush-100 px-8 py-3">
            <p className="text-plush-700 font-medium">
              +1.200 profissionais já utilizam o Plushify para gerenciar seus negócios
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
