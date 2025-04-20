
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DesktopMenuProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const DesktopMenu = ({ onLogin, onSignUp }: DesktopMenuProps) => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link to="/" className="text-foreground/80 hover:text-plush-600 transition-colors">
        Início
      </Link>
      <Link to="#features" className="text-foreground/80 hover:text-plush-600 transition-colors">
        Funcionalidades
      </Link>
      <Link to="#pricing" className="text-foreground/80 hover:text-plush-600 transition-colors">
        Planos
      </Link>
      <Link to="#testimonials" className="text-foreground/80 hover:text-plush-600 transition-colors">
        Depoimentos
      </Link>
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
