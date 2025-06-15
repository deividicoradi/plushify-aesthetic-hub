
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handlePlanosClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Se estamos na página inicial, fazer scroll até a seção
    if (location.pathname === '/') {
      const planosSection = document.getElementById('planos');
      if (planosSection) {
        planosSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Se não estamos na página inicial, navegar para ela e depois fazer scroll
      navigate('/', { replace: true });
      setTimeout(() => {
        const planosSection = document.getElementById('planos');
        if (planosSection) {
          planosSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setIsOpen(false);
  };

  const handleFuncionalidadesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Se estamos na página inicial, fazer scroll até a seção
    if (location.pathname === '/') {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Se não estamos na página inicial, navegar para ela e depois fazer scroll
      navigate('/', { replace: true });
      setTimeout(() => {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setIsOpen(false);
  };

  const handleDepoimentosClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Se estamos na página inicial, fazer scroll até a seção
    if (location.pathname === '/') {
      const testimonialsSection = document.getElementById('testimonials');
      if (testimonialsSection) {
        testimonialsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Se não estamos na página inicial, navegar para ela e depois fazer scroll
      navigate('/', { replace: true });
      setTimeout(() => {
        const testimonialsSection = document.getElementById('testimonials');
        if (testimonialsSection) {
          testimonialsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setIsOpen(false);
  };

  const handleStartFree = () => {
    navigate('/auth?tab=signup');
    setIsOpen(false);
  };

  const handleSignIn = () => {
    navigate('/auth?tab=signin');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 z-50">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-foreground">Plushify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Início
            </Link>
            <button 
              onClick={handleFuncionalidadesClick}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Funcionalidades
            </button>
            <button 
              onClick={handlePlanosClick}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Planos
            </button>
            <button 
              onClick={handleDepoimentosClick}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Depoimentos
            </button>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              onClick={handleSignIn}
              className="text-muted-foreground hover:text-foreground"
            >
              Entrar
            </Button>
            <Button 
              onClick={handleStartFree}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="mr-2 w-4 h-4" />
              Começar Grátis
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border/40">
              <Link
                to="/"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Início
              </Link>
              <button
                onClick={handleFuncionalidadesClick}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Funcionalidades
              </button>
              <button
                onClick={handlePlanosClick}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Planos
              </button>
              <button
                onClick={handleDepoimentosClick}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Depoimentos
              </button>
              <div className="border-t border-border/40 pt-4 pb-2 space-y-2">
                <Button 
                  variant="ghost" 
                  onClick={handleSignIn}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  Entrar
                </Button>
                <Button 
                  onClick={handleStartFree}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg"
                >
                  <Sparkles className="mr-2 w-4 h-4" />
                  Começar Grátis
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
