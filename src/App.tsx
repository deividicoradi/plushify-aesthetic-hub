import React, { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { CookieConsent } from "@/components/CookieConsent";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { useAnalytics } from "@/hooks/useAnalytics";
import Index from "./pages/Index";
import Plans from "./pages/Plans";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import LGPD from "./pages/LGPD";
import Cookies from "./pages/Cookies";
import Product from "./pages/Product";
import About from "./pages/About";
import Status from "./pages/Status";
import Updates from "./pages/Updates";
import PublicBooking from "./pages/PublicBooking";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { SecurityProvider } from "./components/SecurityProvider";
import { queryClient } from "@/lib/queryClient";
import ScrollToTop from "./components/ScrollToTop";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { CacheOptimizerProvider } from "./components/CacheOptimizer";

// Lazy-loaded protected pages (code-splitting)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Clients = lazy(() => import("./pages/Clients"));
const Financial = lazy(() => import("./pages/Financial"));
const Services = lazy(() => import("./pages/Services"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const Notes = lazy(() => import("./pages/Notes"));
const Loyalty = lazy(() => import("./pages/Loyalty"));
const Inventory = lazy(() => import("./pages/Inventory"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const FinancialDashboard = lazy(() => import("./pages/FinancialDashboard"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
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
      <Route path="/" element={<Index />} />
      <Route path="/product" element={<Product />} />
      <Route path="/about" element={<About />} />
      <Route path="/planos" element={<Plans />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/lgpd" element={<LGPD />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/help" element={<Help />} />
      <Route path="/status" element={<Status />} />
      <Route path="/updates" element={<Updates />} />
      <Route path="/agendar/:userId" element={<PublicBooking />} />
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
        path="/reports"
        element={
          <ProtectedRoute>
            {Lazy(<Reports />)}
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
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            {Lazy(<Profile />)}
          </ProtectedRoute>
        }
      />
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
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            {Lazy(<TeamManagement />)}
          </ProtectedRoute>
        }
      />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
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
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
