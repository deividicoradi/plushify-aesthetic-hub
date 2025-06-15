
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Landing from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Appointments from '@/pages/Appointments';
import Payments from '@/pages/Financial';
import FinancialDashboard from '@/pages/FinancialDashboard';
import AdvancedAnalytics from '@/pages/AdvancedAnalytics';
import Reports from '@/pages/Reports';
import Inventory from '@/pages/Inventory';
import Settings from '@/pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryProvider>
          <ThemeProvider defaultTheme="light" storageKey="plushify-ui-theme">
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/clients" element={
                  <ProtectedRoute>
                    <Clients />
                  </ProtectedRoute>
                } />
                
                <Route path="/appointments" element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                } />
                
                <Route path="/payments" element={
                  <ProtectedRoute>
                    <Payments />
                  </ProtectedRoute>
                } />
                
                <Route path="/financial" element={
                  <ProtectedRoute>
                    <FinancialDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AdvancedAnalytics />
                  </ProtectedRoute>
                } />
                
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                
                <Route path="/inventory" element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Routes>
              <Toaster />
            </div>
          </ThemeProvider>
        </QueryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
