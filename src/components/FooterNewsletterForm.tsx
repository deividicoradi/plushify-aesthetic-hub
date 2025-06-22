
import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Link } from 'react-router-dom';

const FooterNewsletterForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;
    setEnviado(true);
    setNome('');
    setEmail('');
    setAgree(false);
    setTimeout(() => setEnviado(false), 4000);
  };

  return (
    <form className="rounded-lg p-4 bg-muted/50 space-y-3 border border-border max-w-md mx-auto"
      onSubmit={handleSubmit}
    >
      <div>
        <h4 className="font-semibold text-base text-foreground mb-1">Receba novidades</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Cadastre-se para receber dicas, novidades e promoções.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          className="bg-background"
        />
        <Input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="bg-background"
        />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <Checkbox
          id="footer-newsletter-term"
          checked={agree}
          onCheckedChange={v => setAgree(!!v)}
          required
        />
        <Label htmlFor="footer-newsletter-term" className="text-xs text-muted-foreground">
          Concordo com os <Link to="/terms" target="_blank" className="underline hover:text-primary">Termos de Serviço</Link>
        </Label>
      </div>
      <Button
        type="submit"
        className="w-full mt-2"
        disabled={!agree || !nome || !email || enviado}
      >
        {enviado ? 'Enviado!' : 'Cadastrar'}
      </Button>
      {enviado && (
        <div className="text-green-500 text-center text-xs mt-2">
          Inscrição realizada com sucesso!
        </div>
      )}
    </form>
  );
};

export default FooterNewsletterForm;
