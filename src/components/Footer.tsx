
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
              <img 
                src="/logo-modern.svg" 
                alt="Plushify - Beauty Management Platform" 
                className="h-10 w-auto"
                style={{ filter: 'brightness(0.9)' }}
              />
            </Link>
            <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
              Plataforma completa para gestão de salões de beleza e clínicas de estética. 
              Modernize seu negócio com tecnologia e segurança.
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
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">Sobre Nós</Link></li>
              <li><Link to="/planos" className="text-muted-foreground hover:text-foreground transition-colors">Planos e Preços</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Carreiras</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground text-lg mb-6">Produto</h3>
            <ul className="space-y-4">
              <li><Link to="/product" className="text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</Link></li>
              <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Integrações</Link></li>
              <li><Link to="/api" className="text-muted-foreground hover:text-foreground transition-colors">API</Link></li>
              <li><Link to="/updates" className="text-muted-foreground hover:text-foreground transition-colors">Atualizações</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground text-lg mb-6">Suporte</h3>
            <ul className="space-y-4">
              <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Central de Ajuda</Link></li>
              <li>
                <a 
                  href="mailto:suporte@plushify.com.br" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contato
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
              <li><Link to="/status" className="text-muted-foreground hover:text-foreground transition-colors">Status do Sistema</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-muted-foreground text-sm">
                &copy; {currentYear} Plushify Tecnologia Ltda. Todos os direitos reservados.
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                CNPJ: 00.000.000/0001-00 • Responsável técnico: Equipe Plushify
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
              <Link to="/lgpd" className="hover:text-foreground transition-colors">LGPD</Link>
              <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center text-muted-foreground text-xs space-y-2">
              <p className="flex items-center justify-center">
                Desenvolvido com <Heart className="w-4 h-4 mx-1 text-primary fill-primary" /> no Brasil
              </p>
              <p>
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                Seus dados pessoais são tratados com segurança e transparência.
              </p>
              <p>
                Para exercer seus direitos sobre dados pessoais, entre em contato: 
                <a href="mailto:privacidade@plushify.com.br" className="text-primary hover:underline ml-1">
                  privacidade@plushify.com.br
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
