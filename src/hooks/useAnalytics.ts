import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics, trackPageView } from '@/lib/analytics';

// Hook principal para Analytics
export const useAnalytics = () => {
  const location = useLocation();

  // Rastrear mudanças de página automaticamente
  useEffect(() => {
    const pageName = getPageName(location.pathname);
    trackPageView(location.pathname, pageName);
    analytics.pageView(pageName, getPageSection(location.pathname));
  }, [location]);

  return analytics;
};

// Hook para rastreamento manual de páginas
export const usePageTracking = () => {
  const trackPage = (pageName: string, customPath?: string) => {
    const path = customPath || window.location.pathname;
    trackPageView(path, pageName);
    analytics.pageView(pageName);
  };

  return { trackPage };
};

// Utility functions
const getPageName = (pathname: string): string => {
  const routes: Record<string, string> = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/appointments': 'Agendamentos',
    '/clients': 'Clientes',
    '/financial': 'Financeiro',
    '/financial-dashboard': 'Dashboard Financeiro',
    '/services': 'Serviços',
    '/reports': 'Relatórios',
    '/settings': 'Configurações',
    '/notes': 'Notas',
    '/loyalty': 'Fidelidade',
    '/inventory': 'Estoque',
    '/analytics': 'Analytics Avançado',
    '/auth': 'Login',
    '/signup': 'Cadastro',
    '/planos': 'Planos',
    '/help': 'Ajuda',
    '/about': 'Sobre',
    '/product': 'Produto',
    '/terms': 'Termos de Uso',
    '/privacy': 'Política de Privacidade',
    '/lgpd': 'LGPD',
    '/cookies': 'Política de Cookies',
  };

  return routes[pathname] || `Página ${pathname}`;
};

const getPageSection = (pathname: string): string => {
  if (pathname.startsWith('/financial')) return 'Financeiro';
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname === '/' || pathname.startsWith('/about') || pathname.startsWith('/product')) return 'Marketing';
  if (pathname.startsWith('/auth') || pathname.startsWith('/signup')) return 'Autenticação';
  if (pathname.startsWith('/planos')) return 'Planos';
  if (pathname.startsWith('/help') || pathname.includes('terms') || pathname.includes('privacy')) return 'Suporte';
  
  return 'Aplicação';
};