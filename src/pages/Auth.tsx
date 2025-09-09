
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Verificar se o usuário já está logado ao carregar a página
    if (user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Validações de formulário
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    return password === confirmPassword;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validações
      if (!validateEmail(email)) {
        toast.error("Por favor, insira um e-mail válido.");
        return;
      }

      if (!validatePassword(password)) {
        toast.error("A senha deve ter pelo menos 8 caracteres.");
        return;
      }

      if (!validatePasswordMatch(password, confirmPassword)) {
        toast.error("As senhas não coincidem.");
        return;
      }

      if (!fullName.trim()) {
        toast.error("Por favor, insira seu nome completo.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) throw error;
      
      toast.success("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.");
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        toast.error("Este e-mail já está cadastrado. Tente fazer login.");
      } else {
        toast.error(error.message || "Ocorreu um erro ao criar sua conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!validateEmail(email)) {
        toast.error("Por favor, insira um e-mail válido.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      console.log('Login successful, auth context will handle redirect');
      toast.success("Login realizado com sucesso!");
      // Removido redirecionamento manual - o useEffect acima irá lidar com isso
    } catch (error: any) {
      toast.error(error.message || "Falha no login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!validateEmail(recoveryEmail)) {
      toast.error("Por favor, insira um e-mail válido.");
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/auth?recovery=true`,
      });
      
      if (error) throw error;
      
      toast.success("Se existe uma conta com este e-mail, você receberá instruções para redefinir sua senha.");
      setRecoveryMode(false);
    } catch (error: any) {
      toast.error("Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!validatePassword(newPassword)) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: recoveryEmail,
        token: recoveryCode,
        type: 'recovery'
      });
      
      if (error) throw error;
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) throw updateError;
      
      toast.success("Senha redefinida com sucesso! Você pode fazer login agora.");
      setRecoveryMode(false);
    } catch (error: any) {
      toast.error("Código inválido ou expirado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (recoveryMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader className="text-center">
            <CardTitle>Recuperação de Senha</CardTitle>
            <CardDescription>
              Informe seu e-mail para receber instruções de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordRecovery} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">E-mail</Label>
                <Input 
                  id="recovery-email" 
                  name="username"
                  type="email" 
                  placeholder="seu@email.com" 
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-plush-600 hover:bg-plush-700"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar instruções"}
              </Button>
              <Button 
                type="button" 
                variant="ghost"
                className="w-full"
                onClick={() => setRecoveryMode(false)}
              >
                Voltar para o login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRecovery = searchParams.get('recovery') === 'true';
  if (isRecovery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader className="text-center">
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              Digite seu e-mail, o código recebido e sua nova senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email-confirm">E-mail</Label>
                <Input 
                  id="recovery-email-confirm" 
                  name="username"
                  type="email" 
                  placeholder="seu@email.com" 
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recovery-code">Código de verificação</Label>
                <InputOTP maxLength={6} value={recoveryCode} onChange={setRecoveryCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <div className="relative">
                  <Input 
                    id="new-password" 
                    name="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nova senha" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
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
              <Button 
                type="submit" 
                className="w-full bg-plush-600 hover:bg-plush-700"
                disabled={loading}
              >
                {loading ? "Redefinindo..." : "Redefinir senha"}
              </Button>
              <Button 
                type="button" 
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/auth')}
              >
                Voltar para o login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <img src="/lovable-uploads/3e8b9f0f-a4f5-41e8-9bc1-009ded5c26ba.png" alt="Plushify" className="h-16 mx-auto mb-4" />
          <CardTitle>Bem-vindo ao Plushify</CardTitle>
          <CardDescription>
            Gerencie seu negócio de beleza com facilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">E-mail</Label>
                  <Input 
                    id="email-login" 
                    name="username"
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Senha</Label>
                  <div className="relative">
                    <Input 
                      id="password-login" 
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Sua senha" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    onClick={() => setRecoveryMode(true)}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-plush-600 hover:bg-plush-700"
                  disabled={loading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Nome completo</Label>
                  <Input 
                    id="fullname" 
                    name="fullname"
                    type="text" 
                    placeholder="Seu nome completo" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">E-mail</Label>
                  <Input 
                    id="email-signup" 
                    name="username"
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Senha</Label>
                  <div className="relative">
                    <Input 
                      id="password-signup" 
                      name="new-password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Sua senha (mínimo 8 caracteres)" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={8}
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirme sua senha" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-plush-600 hover:bg-plush-700"
                  disabled={loading}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {loading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
