
import React from 'react';
import { Settings as SettingsIcon, User, Shield, Save, X, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { WhatsAppSettings } from '@/components/whatsapp/WhatsAppSettings';

const Settings = () => {
  const { user } = useAuth();
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 ring-1 ring-primary/10">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas preferências e conta
              </p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Conta
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-6">
                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Informações do Perfil</CardTitle>
                        <CardDescription>
                          Atualize suas informações pessoais e profissionais
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                          <Input 
                            id="name" 
                            placeholder="Seu nome completo"
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={user?.email || ''} 
                            disabled 
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                          <Input 
                            id="phone" 
                            placeholder="(00) 00000-0000"
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profession" className="text-sm font-medium">Profissão</Label>
                          <Input 
                            id="profession" 
                            placeholder="Sua profissão"
                            className="bg-background"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" className="gap-2">
                          <X className="w-4 h-4" />
                          Cancelar
                        </Button>
                        <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90">
                          <Save className="w-4 h-4" />
                          Salvar alterações
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="account" className="space-y-6">
                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Segurança da Conta</CardTitle>
                        <CardDescription>
                          Gerencie suas preferências de conta e segurança
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Alterar Senha</h3>
                      <form onSubmit={handleSavePassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Senha Atual</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nova Senha</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" type="button" className="gap-2">
                            <X className="w-4 h-4" />
                            Cancelar
                          </Button>
                          <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90">
                            <Save className="w-4 h-4" />
                            Alterar Senha
                          </Button>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="whatsapp" className="space-y-6">
                <WhatsAppSettings />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
