
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import Index from './pages/Index';
import About from './pages/About';
import Auth from './pages/Auth';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Plans from './pages/Plans';
import PaymentSuccess from './pages/PaymentSuccess';
import Notes from './pages/Notes';
import Loyalty from './pages/Loyalty';
import Courses from './pages/Courses';
import Help from './pages/Help';
import Financial from './pages/Financial';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// Layout component for protected routes with sidebar
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agendamentos"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Appointments />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Clients />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicos"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Services />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/estoque"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Inventory />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/financeiro"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Financial />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Reports />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/anotacoes"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Notes />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fidelidade"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Loyalty />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cursos"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Courses />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Help />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Settings />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/planos"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Plans />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <PaymentSuccess />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <Sonner />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
