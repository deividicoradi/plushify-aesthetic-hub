
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import Index from './pages/Index';
import About from './pages/About';
import Auth from './pages/Auth';
import Signup from './pages/Signup';
import Help from './pages/Help';
import Courses from './pages/Courses';
import Blog from './pages/Blog';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Appointments from './pages/Appointments';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Communication from './pages/Communication';
import Loyalty from './pages/Loyalty';
import Notes from './pages/Notes';
import Settings from './pages/Settings';
import Plans from './pages/Plans';
import NotFound from './pages/NotFound';
import PaymentSuccess from './pages/PaymentSuccess';
import DashboardLayout from './components/DashboardLayout';
import Marketing from './pages/Marketing';
import Analytics from './pages/Analytics';
import Automation from './pages/Automation';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/help" element={<Help />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/blog" element={<Blog />} />
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
                path="/anotacoes" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Notes />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/marketing" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Marketing />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Analytics />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/automacoes" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Automation />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/configuracoes" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route path="/planos" element={<Plans />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
