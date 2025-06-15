
import React from 'react';
import { Settings as SettingsIcon, User, Shield, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <SettingsIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
                  <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="max-w-4xl">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Perfil
                  </TabsTrigger>
                  <TabsTrigger value="account" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Conta
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
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="current-password" className="text-sm font-medium">Senha Atual</Label>
                              <Input 
                                id="current-password" 
                                type="password"
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-password" className="text-sm font-medium">Nova Senha</Label>
                              <Input 
                                id="new-password" 
                                type="password"
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmar Nova Senha</Label>
                              <Input 
                                id="confirm-password" 
                                type="password"
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2">
                            <Save className="w-4 h-4" />
                            Alterar Senha
                          </Button>
                        </form>
                      </div>
                      
                      <div className="border-t pt-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Zona de Perigo</h3>
                          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                              A exclusão da sua conta é permanente e não pode ser desfeita.
                              Todos os seus dados serão excluídos permanentemente.
                            </p>
                            <Button variant="destructive" className="gap-2">
                              <X className="w-4 h-4" />
                              Excluir Conta
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
