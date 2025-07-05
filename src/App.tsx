import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieConsent } from "@/components/CookieConsent";
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
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Status from "./pages/Status";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { SecurityProvider } from "./components/SecurityProvider";
import ScrollToTop from "./components/ScrollToTop";
import { AuthenticatedLayout } from "./components/layout/AuthenticatedLayout";
import { NotificationProvider } from "./components/notifications/NotificationSystem";
import { SkipToContent } from "./components/accessibility/SkipToContent";


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
      <Route path="/plans" element={<Plans />} />
      <Route path="/planos" element={<Plans />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/lgpd" element={<LGPD />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/help" element={<Help />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/status" element={<Status />} />
      
      {/* Protected Routes with Authenticated Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="clients" element={<Clients />} />
        <Route path="financial" element={<Financial />} />
        <Route path="financial-dashboard" element={<FinancialDashboard />} />
        <Route path="services" element={<Services />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notes" element={<Notes />} />
        <Route path="loyalty" element={<Loyalty />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="analytics" element={<AdvancedAnalytics />} />
      </Route>
      
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
              <NotificationProvider>
                <SkipToContent />
                <Toaster />
                <Sonner />
                 <BrowserRouter>
                   <ScrollToTop />
                   <AppContent />
                 </BrowserRouter>
                <CookieConsent />
              </NotificationProvider>
            </AuthProvider>
          </SecurityProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
