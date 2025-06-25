
import React from 'react';
import { Users } from 'lucide-react';

const AboutStory = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
              Nossa Origem
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Como Tudo Começou
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p>
                O Plushify nasceu da observação de uma lacuna real no mercado brasileiro de beleza e estética. 
                Percebemos que profissionais talentosos estavam limitados por ferramentas obsoletas e processos 
                manuais que consumiam tempo precioso que poderia ser dedicado ao que realmente importa: seus clientes.
              </p>
              <p>
                Nossa equipe multidisciplinar, composta por desenvolvedores experientes, designers especializados 
                em UX e consultores de negócios do setor de beleza, uniu forças para criar uma solução verdadeiramente 
                transformadora. Não queríamos apenas mais um software, mas sim uma plataforma que revolucionasse 
                a forma como o setor opera.
              </p>
              <p>
                Hoje, o Plushify é reconhecido como a solução mais completa e confiável do mercado, atendendo 
                desde profissionais autônomos até grandes redes de franquias, sempre mantendo nosso compromisso 
                com a qualidade, inovação e suporte excepcional.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="relative bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-3xl p-8 h-96 flex items-center justify-center backdrop-blur-sm border border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl"></div>
              <Users className="w-32 h-32 text-primary relative z-10" />
              <div className="absolute top-4 right-4 w-16 h-16 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-20 h-20 bg-accent2-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStory;
