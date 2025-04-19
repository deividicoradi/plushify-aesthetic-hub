
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Plushify" className="h-10" />
        </Link>

        {/* Desktop Menu */}
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
            <Button variant="outline" className="border-plush-200 hover:border-plush-400 text-plush-700">
              Entrar
            </Button>
            <Button className="bg-plush-600 hover:bg-plush-700 text-white">
              Começar Grátis
            </Button>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center text-plush-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white/95 backdrop-blur-sm z-40 flex flex-col md:hidden">
          <div className="container mx-auto px-4 py-8 flex flex-col space-y-6">
            <Link
              to="/"
              className="text-lg font-medium py-2 px-4 hover:bg-plush-50 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              to="#features"
              className="text-lg font-medium py-2 px-4 hover:bg-plush-50 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link
              to="#pricing"
              className="text-lg font-medium py-2 px-4 hover:bg-plush-50 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Planos
            </Link>
            <Link
              to="#testimonials"
              className="text-lg font-medium py-2 px-4 hover:bg-plush-50 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Depoimentos
            </Link>
            <div className="flex flex-col space-y-3 pt-4">
              <Button variant="outline" className="w-full border-plush-200 hover:border-plush-400 text-plush-700">
                Entrar
              </Button>
              <Button className="w-full bg-plush-600 hover:bg-plush-700 text-white">
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
