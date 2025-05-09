
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface MobileMenuProps {
  isOpen: boolean;
  onLogin: () => void;
  onSignUp: () => void;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onLogin, onSignUp, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      onClose(); // Close the mobile menu after clicking
    }
  };

  return (
    <div className="fixed inset-0 top-16 bg-white/95 backdrop-blur-sm z-40 flex flex-col md:hidden">
      <div className="container mx-auto px-4 py-8 flex flex-col space-y-6">
        <Link
          to="/"
          className="text-lg font-medium py-2 px-4 hover:bg-plush-50 rounded-md transition-colors"
          onClick={onClose}
        >
          Início
        </Link>
        <button
          onClick={() => scrollToSection('features')}
          className="text-lg font-medium py-2 px-4 hover:bg-plush-50 rounded-md transition-colors text-left bg-transparent w-full"
        >
          Funcionalidades
        </button>
        <button
          onClick={() => scrollToSection('pricing')}
          className="text-lg font-medium py-2 px-4 hover:bg-plush-50 rounded-md transition-colors text-left bg-transparent w-full"
        >
          Planos
        </button>
        <button
          onClick={() => scrollToSection('testimonials')}
          className="text-lg font-medium py-2 px-4 hover:bg-plush-50 rounded-md transition-colors text-left bg-transparent w-full"
        >
          Depoimentos
        </button>
        <div className="flex flex-col space-y-3 pt-4">
          <Button 
            variant="outline" 
            className="w-full border-plush-200 hover:border-plush-400 text-plush-700"
            onClick={onLogin}
          >
            Entrar
          </Button>
          <Button 
            className="w-full bg-plush-600 hover:bg-plush-700 text-white"
            onClick={onSignUp}
          >
            Começar Grátis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
