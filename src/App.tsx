
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Page imports
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Communication from "./pages/Communication";
import Courses from "./pages/Courses";
import Inventory from "./pages/Inventory";
import Plans from "./pages/Plans";
import Clients from "./pages/Clients";
import Loyalty from "./pages/Loyalty";
import Signup from "./pages/Signup";
import Notes from "./pages/Notes";
import PaymentSuccess from "./pages/PaymentSuccess";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cadastro" element={<Signup />} />
              <Route path="/payment-success" element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } />

              {/* Dashboard Routes with Layout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/notes" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Notes />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/agendamentos" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Appointments />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/comunicacao" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Communication />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/cursos" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Courses />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/estoque" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Inventory />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/planos" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Plans />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/clientes" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Clients />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/fidelidade" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Loyalty />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Help />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
