
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    serviceType: '',
    acceptTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceType: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, acceptTerms: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não correspondem",
        description: "A senha e a confirmação da senha devem ser iguais.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Termos e condições",
        description: "Você deve aceitar os termos e condições para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo(a) ao Plushify! Redirecionando para o dashboard.",
      });
      
      // Redirect to dashboard after successful signup
      setTimeout(() => navigate('/dashboard'), 1500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-plush-100 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="w-6 h-6 text-plush-600" />
          <h1 className="text-2xl font-bold">Cadastre-se no Plushify</h1>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Crie sua conta gratuita e tenha acesso a todas as funcionalidades do Plushify.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Seu nome completo" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="seu@email.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Tipo de serviço</Label>
            <Select value={formData.serviceType} onValueChange={handleServiceTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="estetica">Estética</SelectItem>
                <SelectItem value="cabelo">Cabelo/Barbearia</SelectItem>
                <SelectItem value="unhas">Unhas/Manicure</SelectItem>
                <SelectItem value="massagem">Massagem</SelectItem>
                <SelectItem value="spa">Spa</SelectItem>
                <SelectItem value="clinica">Clínica Estética</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="Sua senha" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              placeholder="Confirme sua senha" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="terms" 
              checked={formData.acceptTerms} 
              onCheckedChange={handleCheckboxChange} 
            />
            <Label htmlFor="terms" className="text-sm">
              Eu aceito os <a href="#" className="text-plush-600 hover:underline">termos e condições</a> do Plushify
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-plush-600 hover:bg-plush-700 mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Criar minha conta"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta? <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }} 
            className="text-plush-600 hover:underline"
          >
            Fazer login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
