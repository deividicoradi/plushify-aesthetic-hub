
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, User, Eye, EyeOff } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validação de email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações simples
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Por favor, insira um e-mail válido");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Login realizado com sucesso!");
      onOpenChange(false);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou senha inválidos");
      } else {
        toast.error(error.message || "Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) throw error;
      
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login com Google");
    }
  };
  
  const handleSignUp = () => {
    onOpenChange(false);
    navigate('/auth?tab=signup');
  };

  const handleForgotPassword = () => {
    onOpenChange(false);
    navigate('/auth?recovery=true');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Entrar no Plushify</DialogTitle>
          <DialogDescription>
            Faça login para acessar sua conta e gerenciar seu negócio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">E-mail</Label>
            <Input
              id="login-email"
              name="username"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Senha</Label>
            <div className="relative">
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>
          
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-plush-600 hover:underline"
              onClick={handleForgotPassword}
            >
              Esqueceu sua senha?
            </button>
          </div>
          
          <Button className="w-full bg-plush-600 hover:bg-plush-700 text-white" type="submit" disabled={loading}>
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? "Entrando..." : "Entrar com E-mail"}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} type="button" disabled={loading}>
            <User className="mr-2 h-4 w-4" />
            Entrar com Google
          </Button>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <button
              type="button"
              className="text-plush-600 hover:underline font-medium"
              onClick={handleSignUp}
            >
              Cadastre-se
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
