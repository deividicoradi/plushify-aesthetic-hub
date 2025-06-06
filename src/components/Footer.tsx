
import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img src="/logo.svg" alt="Plushify" className="h-10 filter dark:brightness-0 dark:invert" />
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Plushify é uma plataforma completa para profissionais de estética gerenciarem agendamentos, 
              clientes, cursos e marketing com ferramentas inteligentes de IA.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/plushify" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com/plushify" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/plushify" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4 text-card-foreground">Empresa</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">Sobre nós</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors">Carreiras</Link></li>
              <li><Link to="/press" className="text-muted-foreground hover:text-primary transition-colors">Imprensa</Link></li>
              <li><Link to="/partners" className="text-muted-foreground hover:text-primary transition-colors">Parceiros</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4 text-card-foreground">Produto</h3>
            <ul className="space-y-3">
              <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-muted-foreground hover:text-primary transition-colors bg-transparent text-left">Funcionalidades</button></li>
              <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-muted-foreground hover:text-primary transition-colors bg-transparent text-left">Preços</button></li>
              <li><Link to="/integrations" className="text-muted-foreground hover:text-primary transition-colors">Integrações</Link></li>
              <li><Link to="/roadmap" className="text-muted-foreground hover:text-primary transition-colors">Roteiro</Link></li>
              <li><Link to="/updates" className="text-muted-foreground hover:text-primary transition-colors">Atualizações</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4 text-card-foreground">Suporte</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">Ajuda & FAQ</Link></li>
              <li><Link to="/docs" className="text-muted-foreground hover:text-primary transition-colors">Documentação</Link></li>
              <li><Link to="/community" className="text-muted-foreground hover:text-primary transition-colors">Comunidade</Link></li>
              <li><Link to="/status" className="text-muted-foreground hover:text-primary transition-colors">Status</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contato</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-muted-foreground text-sm">
                &copy; {currentYear} Plushify. Todos os direitos reservados.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-primary transition-colors">Termos de Serviço</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacidade</Link>
              <Link to="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
              <Link to="/accessibility" className="hover:text-primary transition-colors">Acessibilidade</Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-muted-foreground text-xs">
            <p className="flex items-center justify-center">
              Feito com <Heart className="w-3 h-3 mx-1 text-primary fill-primary" /> no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
