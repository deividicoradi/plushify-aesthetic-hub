import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

// O link de confirmação do e-mail é aberto pelo cliente de e-mail SEMPRE em
// uma nova aba/janela — não é possível impedir isso. Então, em vez de já
// jogar essa nova aba dentro do app (deixando duas abas logadas), aqui a
// gente apenas confirma, avisa a aba original (que faz o redirect pro
// dashboard sozinha) e tenta fechar esta aba.
const EmailConfirmed = () => {
  const [canClose, setCanClose] = useState(true);

  useEffect(() => {
    // Notifica outras abas abertas (a do cadastro) que a conta foi confirmada.
    try {
      localStorage.setItem('plushify:email-confirmed', String(Date.now()));
    } catch (_) { /* storage indisponível */ }

    const timer = window.setTimeout(() => {
      window.close();
      // Se o navegador bloquear o close (aba não aberta por script), mostra
      // a instrução manual.
      setCanClose(false);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SEO title="E-mail confirmado | Plushify" description="Seu e-mail foi confirmado com sucesso." />
      <Card className="w-full max-w-md rounded-3xl shadow-lg">
        <CardHeader className="items-center text-center space-y-3">
          <Logo />
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <CardTitle>E-mail confirmado!</CardTitle>
          <CardDescription>
            {canClose
              ? 'Você já pode voltar para a aba onde fez o cadastro — ela continua de onde parou.'
              : 'Pode fechar esta aba e voltar para a aba onde fez o cadastro, ela já está liberada.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard">Continuar aqui</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmed;