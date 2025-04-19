
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Page imports
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Communication from "./pages/Communication";
import Courses from "./pages/Courses";
import Inventory from "./pages/Inventory";
import Plans from "./pages/Plans";
import Clients from "./pages/Clients";
import Loyalty from "./pages/Loyalty";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cadastro" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agendamentos" element={<Appointments />} />
          <Route path="/comunicacao" element={<Communication />} />
          <Route path="/cursos" element={<Courses />} />
          <Route path="/estoque" element={<Inventory />} />
          <Route path="/planos" element={<Plans />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/fidelidade" element={<Loyalty />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
