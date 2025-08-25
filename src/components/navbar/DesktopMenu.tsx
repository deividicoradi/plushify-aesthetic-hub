
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { WhatsAppHeaderButton } from "@/components/whatsapp/WhatsAppHeaderButton";

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
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Início
      </button>
      <button 
        onClick={() => scrollToSection('features')} 
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Funcionalidades
      </button>
      <button 
        onClick={() => scrollToSection('pricing')} 
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Planos
      </button>
      <button 
        onClick={() => scrollToSection('testimonials')} 
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Depoimentos
      </button>
      <div className="flex items-center space-x-3">
        <WhatsAppHeaderButton />
        <ThemeToggle />
        <Button 
          variant="outline"
          onClick={onLogin}
          className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Entrar
        </Button>
        <Button 
          onClick={onSignUp}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Começar Grátis
        </Button>
      </div>
    </nav>
  );
};

export default DesktopMenu;
