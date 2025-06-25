
import React from 'react';
import { Award, Users, Shield } from 'lucide-react';

const AboutCommitments = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/50 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            Nossos Diferenciais
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            O Que Nos Move
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Excelência Técnica</h3>
            <p className="text-muted-foreground leading-relaxed">
              Desenvolvemos cada linha de código com precisão e rigor técnico, garantindo 
              uma plataforma robusta, confiável e sempre atualizada com as últimas 
              tendências tecnológicas do mercado.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Parceria Verdadeira</h3>
            <p className="text-muted-foreground leading-relaxed">
              Não somos apenas um fornecedor de software, somos parceiros no seu sucesso. 
              Nossa equipe especializada oferece suporte contínuo, treinamentos personalizados 
              e consultoria estratégica para maximizar seus resultados.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Segurança Total</h3>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados e os de seus clientes estão protegidos pelos mais altos padrões 
              de segurança digital. Somos 100% compatíveis com a LGPD e utilizamos 
              criptografia de ponta para garantir a privacidade e integridade das informações.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCommitments;
