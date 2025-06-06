
import React from 'react';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface MobileMenuProps {
  isOpen: boolean;
  onLogin: () => void;
  onSignUp: () => void;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onLogin, onSignUp, onClose }: MobileMenuProps) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 py-4 space-y-4">
        <button 
          onClick={() => scrollToSection('top')} 
          className="block w-full text-left text-foreground/80 hover:text-primary transition-colors py-2"
        >
          Início
        </button>
        <button 
          onClick={() => scrollToSection('features')} 
          className="block w-full text-left text-foreground/80 hover:text-primary transition-colors py-2"
        >
          Funcionalidades
        </button>
        <button 
          onClick={() => scrollToSection('pricing')} 
          className="block w-full text-left text-foreground/80 hover:text-primary transition-colors py-2"
        >
          Planos
        </button>
        <button 
          onClick={() => scrollToSection('testimonials')} 
          className="block w-full text-left text-foreground/80 hover:text-primary transition-colors py-2"
        >
          Depoimentos
        </button>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <ThemeToggle />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onLogin}
            >
              Entrar
            </Button>
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={onSignUp}
            >
              Começar Grátis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
