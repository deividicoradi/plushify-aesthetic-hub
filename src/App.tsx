import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieConsent } from "@/components/CookieConsent";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { useAnalytics } from "@/hooks/useAnalytics";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Financial from "./pages/Financial";
import Services from "./pages/Services";
import Reports from "./pages/Reports";
import Plans from "./pages/Plans";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Notes from "./pages/Notes";
import Loyalty from "./pages/Loyalty";
import Inventory from "./pages/Inventory";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import FinancialDashboard from "./pages/FinancialDashboard";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import LGPD from "./pages/LGPD";
import Cookies from "./pages/Cookies";
import Product from "./pages/Product";
import About from "./pages/About";
import Status from "./pages/Status";
import Updates from "./pages/Updates";
import TeamManagement from "./pages/TeamManagement";
import PublicBooking from "./pages/PublicBooking";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { SecurityProvider } from "./components/SecurityProvider";
import ScrollToTop from "./components/ScrollToTop";


const queryClient = new QueryClient();

// Security: Remove Lovable token from URL
if (typeof window !== 'undefined' && window.location.search.includes('__lovable_token')) {
  const url = new URL(window.location.href);
  url.searchParams.delete('__lovable_token');
  window.history.replaceState({}, '', url.toString());
}

const AppContent = () => {
  // Inicializar analytics tracking
  useAnalytics();
  
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
      <Route path="/agendar" element={<PublicBooking />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial"
        element={
          <ProtectedRoute>
            <Financial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-dashboard"
        element={
          <ProtectedRoute>
            <FinancialDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loyalty"
        element={
          <ProtectedRoute>
            <Loyalty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AdvancedAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamManagement />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <SecurityProvider>
            <AuthProvider>
              <PWAProvider>
                <Toaster />
                <Sonner />
                 <BrowserRouter>
                   <ScrollToTop />
                   <AppContent />
                 </BrowserRouter>
                 <CookieConsent />
              </PWAProvider>
            </AuthProvider>
          </SecurityProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
