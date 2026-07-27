import React, { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { CookieConsent } from "@/components/CookieConsent";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AuthProvider } from "./contexts/AuthContext";
import { StaffModeProvider } from "./contexts/StaffModeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { SecurityProvider } from "./components/SecurityProvider";
import { queryClient } from "@/lib/queryClient";
import ScrollToTop from "./components/ScrollToTop";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { CacheOptimizerProvider } from "./components/CacheOptimizer";

// Lazy-loaded public/institutional pages (code-splitting) — só o layout
// de rota (App.tsx) precisa carregar de cara; marketing/legal/auth pesam
// no chunk de entrada sem benefício pra quem já está logado.
const Index = lazy(() => import("./pages/Index"));
const Plans = lazy(() => import("./pages/Plans"));
const Auth = lazy(() => import("./pages/Auth"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Help = lazy(() => import("./pages/Help"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const LGPD = lazy(() => import("./pages/LGPD"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Product = lazy(() => import("./pages/Product"));
const About = lazy(() => import("./pages/About"));
const Updates = lazy(() => import("./pages/Updates"));
const PublicBooking = lazy(() => import("./pages/PublicBooking"));

// Lazy-loaded protected pages (code-splitting)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Clients = lazy(() => import("./pages/Clients"));
const Financial = lazy(() => import("./pages/Financial"));
const Services = lazy(() => import("./pages/Services"));
const Settings = lazy(() => import("./pages/Settings"));
const Notes = lazy(() => import("./pages/Notes"));
const Loyalty = lazy(() => import("./pages/Loyalty"));
const Inventory = lazy(() => import("./pages/Inventory"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const FinancialDashboard = lazy(() => import("./pages/FinancialDashboard"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const PlansInternal = lazy(() => import("./pages/PlansInternal"));

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
  </div>
);

const Lazy = (node: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
);


// Security: Remove Lovable token from URL
if (typeof window !== 'undefined' && window.location.search.includes('__lovable_token')) {
  const url = new URL(window.location.href);
  url.searchParams.delete('__lovable_token');
  window.history.replaceState({}, '', url.toString());
}

const AppContent = () => {
  // Inicializar analytics tracking
  useAnalytics();
  
  // Log de diagnóstico do router apenas em dev
  if (import.meta.env.DEV) {
    console.log('[ROUTER] mapa de rotas carregado OK (basename: ./, public: /, private: /dashboard, 404: *)');
  }
  
  return (
    <Routes>
      <Route path="/" element={Lazy(<Index />)} />
      <Route path="/product" element={Lazy(<Product />)} />
      <Route path="/about" element={Lazy(<About />)} />
      <Route path="/planos" element={Lazy(<Plans />)} />
      <Route path="/auth" element={Lazy(<Auth />)} />
      <Route path="/signup" element={Lazy(<Signup />)} />
      <Route path="/terms" element={Lazy(<Terms />)} />
      <Route path="/privacy" element={Lazy(<Privacy />)} />
      <Route path="/lgpd" element={Lazy(<LGPD />)} />
      <Route path="/cookies" element={Lazy(<Cookies />)} />
      <Route path="/help" element={Lazy(<Help />)} />
      <Route path="/updates" element={Lazy(<Updates />)} />
      <Route path="/agendar/:slug" element={Lazy(<PublicBooking />)} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {Lazy(<Dashboard />)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            {Lazy(<Appointments />)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            {Lazy(<Clients />)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial"
        element={
          <ProtectedRoute>
            {Lazy(<Financial />)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-dashboard"
        element={
          <ProtectedRoute>
            {Lazy(<FinancialDashboard />)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            {Lazy(<Services />)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            {Lazy(<Settings />)}
          </ProtectedRoute>
        }
      />
      {/* Perfil virou uma aba dentro de /settings (evita duplicidade com Configuracoes) */}
      <Route path="/profile" element={<Navigate to="/settings" replace />} />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            {Lazy(<Notes />)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/loyalty"
        element={
          <ProtectedRoute>
            {Lazy(<Loyalty />)}
          </ProtectedRoute>
        }
      />
      {/* Pacotes de Serviços virou uma aba dentro de /services */}
      <Route path="/packages" element={<Navigate to="/services" replace />} />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            {Lazy(<Inventory />)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            {Lazy(<AdvancedAnalytics />)}
          </ProtectedRoute>
        }
      />
      {/* Gestão de Equipe virou uma aba dentro de /settings */}
      <Route path="/team" element={<Navigate to="/settings" replace />} />
      <Route
        path="/app/help"
        element={
          <ProtectedRoute>
            {Lazy(<HelpCenter />)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/planos"
        element={
          <ProtectedRoute>
            {Lazy(<PlansInternal />)}
          </ProtectedRoute>
        }
      />
      <Route path="*" element={Lazy(<NotFound />)} />
    </Routes>
  );
};

const App = () => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <StaffModeProvider>
            <SecurityProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <TooltipProvider>
                  <CacheOptimizerProvider>
                    <PWAProvider>
                      <PerformanceMonitor />
                      <ScrollToTop />
                      <AppContent />
                      <Sonner />
                      <CookieConsent />
                    </PWAProvider>
                  </CacheOptimizerProvider>
                </TooltipProvider>
              </ThemeProvider>
            </SecurityProvider>
            </StaffModeProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
