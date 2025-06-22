
import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import FooterNewsletterForm from './FooterNewsletterForm';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Newsletter Form */}
        <div className="mb-12">
          <FooterNewsletterForm />
        </div>
        {/* Seções do rodapé */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="inline-block mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">P</span>
                </div>
                <span className="text-foreground font-bold text-xl">Plushify</span>
              </div>
            </Link>
            <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
              Sistema completo para gestão de salões de beleza e clínicas de estética com 
              agendamentos, controle financeiro, fidelidade e relatórios inteligentes.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/plushify" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/plushify" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/plushify" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground text-lg mb-6">Empresa</h3>
            <ul className="space-y-4">
              <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Ajuda & FAQ</Link></li>
              <li><Link to="/plans" className="text-muted-foreground hover:text-foreground transition-colors">Planos</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contato</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground text-lg mb-6">Produto</h3>
            <ul className="space-y-4">
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/appointments" className="text-muted-foreground hover:text-foreground transition-colors">Agendamentos</Link></li>
              <li><Link to="/clients" className="text-muted-foreground hover:text-foreground transition-colors">Clientes</Link></li>
              <li><Link to="/financial" className="text-muted-foreground hover:text-foreground transition-colors">Financeiro</Link></li>
              <li><Link to="/reports" className="text-muted-foreground hover:text-foreground transition-colors">Relatórios</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground text-lg mb-6">Suporte</h3>
            <ul className="space-y-4">
              <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Central de Ajuda</Link></li>
              <li>
                <a 
                  href="mailto:suporte@plushify.com" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Email Suporte
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-muted-foreground text-sm">
                &copy; {currentYear} Plushify. Todos os direitos reservados.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">Termos de Serviço</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
              <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
              <Link to="/accessibility" className="hover:text-foreground transition-colors">Acessibilidade</Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-muted-foreground text-sm">
            <p className="flex items-center justify-center">
              Feito com <Heart className="w-4 h-4 mx-1 text-primary fill-primary" /> no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
