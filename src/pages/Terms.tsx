
import React from "react";

const sections = [
  {
    title: "1. Aceitação dos Termos",
    content:
      "Ao acessar ou usar a plataforma Plushify, você concorda em cumprir estes Termos de Serviço e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, por favor, não utilize a nossa plataforma."
  },
  {
    title: "2. Uso da Plataforma",
    content:
      "O Plushify oferece ferramentas para gestão de clínicas de estética e profissionais autônomos. Você concorda em usar a plataforma apenas para fins legais e de acordo com todas as normas aplicáveis."
  },
  {
    title: "3. Privacidade",
    content:
      "Suas informações pessoais são tratadas de acordo com a nossa Política de Privacidade. Ao utilizar nosso serviço, você concorda com a coleta e uso dessas informações conforme descrito."
  },
  {
    title: "4. Propriedade Intelectual",
    content:
      "Todo o conteúdo da plataforma, incluindo textos, imagens, logos e códigos, pertence ao Plushify ou seus licenciadores. É proibida a reprodução ou uso sem autorização prévia, exceto nos casos permitidos por lei."
  },
  {
    title: "5. Cancelamento e Suspensão",
    content:
      "Reservamo-nos o direito de suspender ou encerrar o acesso de qualquer usuário que viole estes Termos ou que faça uso indevido da plataforma."
  },
  {
    title: "6. Alterações dos Termos",
    content:
      "Podemos atualizar estes Termos periodicamente. Quaisquer alterações serão comunicadas aos usuários pelos canais disponíveis e entrarão em vigor imediatamente após sua publicação."
  },
  {
    title: "7. Contato",
    content:
      "Se você tiver dúvidas sobre estes Termos ou sobre a plataforma Plushify, entre em contato pelo e-mail: atendimento@plushify.com.br."
  }
];

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4">
      <div className="w-full max-w-2xl mx-auto py-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-primary text-center">Termos de Serviço</h1>
        <p className="text-base text-muted-foreground mb-10 text-center">
          Última atualização: 15 de Junho de 2025
        </p>

        <div className="rounded-lg bg-card/80 shadow-lg border border-border/50 p-6 md:p-10">
          {sections.map((section, i) => (
            <section key={i} className="mb-7 last:mb-0">
              <h2 className="font-semibold text-lg md:text-xl text-primary mb-2">{section.title}</h2>
              <p className="text-muted-foreground text-sm md:text-base">{section.content}</p>
            </section>
          ))}
        </div>
        <div className="mt-10 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Plushify. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default Terms;
