
import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-plush-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img src="/logo.svg" alt="Plushify" className="h-10" />
            </Link>
            <p className="text-foreground/70 mb-6 max-w-md">
              Plushify é uma plataforma completa para profissionais de estética gerenciarem agendamentos, 
              clientes, cursos e marketing com ferramentas inteligentes de IA.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/plushify" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-plush-50 flex items-center justify-center text-plush-600 hover:bg-plush-100 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com/plushify" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-plush-50 flex items-center justify-center text-plush-600 hover:bg-plush-100 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/plushify" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-plush-50 flex items-center justify-center text-plush-600 hover:bg-plush-100 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-foreground/70 hover:text-plush-600 transition-colors">Sobre nós</Link></li>
              <li><Link to="/blog" className="text-foreground/70 hover:text-plush-600 transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-foreground/70 hover:text-plush-600 transition-colors">Carreiras</Link></li>
              <li><Link to="/press" className="text-foreground/70 hover:text-plush-600 transition-colors">Imprensa</Link></li>
              <li><Link to="/partners" className="text-foreground/70 hover:text-plush-600 transition-colors">Parceiros</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Produto</h3>
            <ul className="space-y-3">
              <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-foreground/70 hover:text-plush-600 transition-colors bg-transparent text-left">Funcionalidades</button></li>
              <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-foreground/70 hover:text-plush-600 transition-colors bg-transparent text-left">Preços</button></li>
              <li><Link to="/integrations" className="text-foreground/70 hover:text-plush-600 transition-colors">Integrações</Link></li>
              <li><Link to="/roadmap" className="text-foreground/70 hover:text-plush-600 transition-colors">Roteiro</Link></li>
              <li><Link to="/updates" className="text-foreground/70 hover:text-plush-600 transition-colors">Atualizações</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-foreground/70 hover:text-plush-600 transition-colors">Ajuda & FAQ</Link></li>
              <li><Link to="/docs" className="text-foreground/70 hover:text-plush-600 transition-colors">Documentação</Link></li>
              <li><Link to="/community" className="text-foreground/70 hover:text-plush-600 transition-colors">Comunidade</Link></li>
              <li><Link to="/status" className="text-foreground/70 hover:text-plush-600 transition-colors">Status</Link></li>
              <li><Link to="/contact" className="text-foreground/70 hover:text-plush-600 transition-colors">Contato</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-plush-100">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-foreground/60 text-sm">
                &copy; {currentYear} Plushify. Todos os direitos reservados.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-foreground/60">
              <Link to="/terms" className="hover:text-plush-600 transition-colors">Termos de Serviço</Link>
              <Link to="/privacy" className="hover:text-plush-600 transition-colors">Privacidade</Link>
              <Link to="/cookies" className="hover:text-plush-600 transition-colors">Cookies</Link>
              <Link to="/accessibility" className="hover:text-plush-600 transition-colors">Acessibilidade</Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-foreground/60 text-xs">
            <p className="flex items-center justify-center">
              Feito com <Heart className="w-3 h-3 mx-1 text-plush-500 fill-plush-500" /> no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
