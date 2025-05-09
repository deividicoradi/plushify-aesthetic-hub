
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DesktopMenuProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const DesktopMenu = ({ onLogin, onSignUp }: DesktopMenuProps) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link to="/" className="text-foreground/80 hover:text-plush-600 transition-colors">
        Início
      </Link>
      <button 
        onClick={() => scrollToSection('features')} 
        className="text-foreground/80 hover:text-plush-600 transition-colors bg-transparent"
      >
        Funcionalidades
      </button>
      <button 
        onClick={() => scrollToSection('pricing')} 
        className="text-foreground/80 hover:text-plush-600 transition-colors bg-transparent"
      >
        Planos
      </button>
      <button 
        onClick={() => scrollToSection('testimonials')} 
        className="text-foreground/80 hover:text-plush-600 transition-colors bg-transparent"
      >
        Depoimentos
      </button>
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          className="border-plush-200 hover:border-plush-400 text-plush-700"
          onClick={onLogin}
        >
          Entrar
        </Button>
        <Button 
          className="bg-plush-600 hover:bg-plush-700 text-white"
          onClick={onSignUp}
        >
          Começar Grátis
        </Button>
      </div>
    </nav>
  );
};

export default DesktopMenu;
