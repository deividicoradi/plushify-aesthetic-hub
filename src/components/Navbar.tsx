
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import DesktopMenu from './navbar/DesktopMenu';
import MobileMenu from './navbar/MobileMenu';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleSignUp = () => {
    navigate('/auth?tab=signup');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm py-3 border-b border-border' : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="Plushify" className="h-10 filter dark:brightness-0 dark:invert" />
          </Link>

          <DesktopMenu onLogin={handleLogin} onSignUp={handleSignUp} />

          <button
            className="md:hidden flex items-center text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <MobileMenu 
          isOpen={isMobileMenuOpen}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </header>

      <LoginModal 
        open={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen} 
      />
    </>
  );
};

export default Navbar;
