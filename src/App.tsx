
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useSubscription } from './hooks/useSubscription';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Appointments from './pages/Appointments';
import Communication from './pages/Communication';
import Inventory from './pages/Inventory';
import Notes from './pages/Notes';
import Loyalty from './pages/Loyalty';
import Plans from './pages/Plans';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Courses from './pages/Courses';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import DashboardLayout from './components/DashboardLayout';
import PaymentSuccess from './pages/PaymentSuccess';
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import About from './pages/About';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import Press from './pages/Press';
import Partners from './pages/Partners';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-plush-600"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to auth
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  // Allow navigation for authenticated users (removed subscription check for testing)
  return <>{children}</>;
};

const PlansRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-plush-600"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to auth with plans redirect
  if (!user) {
    return <Navigate to="/auth?redirect=planos" />;
  }
  
  return <>{children}</>;
};

function App() {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <div className="min-h-screen">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/press" element={<Press />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route 
                  path="/planos" 
                  element={
                    <PlansRoute>
                      <DashboardLayout>
                        <Plans />
                      </DashboardLayout>
                    </PlansRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Dashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/clientes" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Clients />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/agendamentos" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Appointments />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/comunicacao" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Communication />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/estoque" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Inventory />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/notes" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Notes />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/fidelidade" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Loyalty />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/financeiro" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <div>Módulo Financeiro</div>
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/relatorios" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Reports />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Settings />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/help" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Help />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cursos" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Courses />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
