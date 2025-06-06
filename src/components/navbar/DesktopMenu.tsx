
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface DesktopMenuProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const DesktopMenu = ({ onLogin, onSignUp }: DesktopMenuProps) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <button 
        onClick={() => scrollToSection('top')} 
        className="text-foreground/80 hover:text-primary transition-colors bg-transparent"
      >
        Início
      </button>
      <button 
        onClick={() => scrollToSection('features')} 
        className="text-foreground/80 hover:text-primary transition-colors bg-transparent"
      >
        Funcionalidades
      </button>
      <button 
        onClick={() => scrollToSection('pricing')} 
        className="text-foreground/80 hover:text-primary transition-colors bg-transparent"
      >
        Planos
      </button>
      <button 
        onClick={() => scrollToSection('testimonials')} 
        className="text-foreground/80 hover:text-primary transition-colors bg-transparent"
      >
        Depoimentos
      </button>
      <div className="flex items-center space-x-3">
        <ThemeToggle />
        <Button 
          variant="outline"
          onClick={onLogin}
        >
          Entrar
        </Button>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onSignUp}
        >
          Começar Grátis
        </Button>
      </div>
    </nav>
  );
};

export default DesktopMenu;
