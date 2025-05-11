
import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";

const Settings = () => {
  const { user } = useAuth();
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Perfil atualizado com sucesso");
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notificações atualizadas");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <SettingsIcon className="w-6 h-6 text-plush-600" />
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={handleSaveProfile}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Seu nome completo" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled />
                    <p className="text-sm text-gray-500">O e-mail não pode ser alterado</p>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="profession">Profissão</Label>
                    <Input id="profession" placeholder="Sua profissão" />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancelar</Button>
              <Button type="submit" form="profile-form">Salvar alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Conta</CardTitle>
              <CardDescription>
                Gerencie suas preferências de conta e segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Alterar senha</h3>
                <div className="grid gap-3">
                  <Label htmlFor="current-password">Senha atual</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Confirmar senha</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button className="mt-2" variant="outline">Alterar senha</Button>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-lg font-medium">Excluir conta</h3>
                <p className="text-sm text-gray-500">
                  A exclusão da sua conta é permanente e não pode ser desfeita.
                  Todos os seus dados serão excluídos permanentemente.
                </p>
                <Button variant="destructive">Excluir conta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Gerencie como você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="notifications-form" onSubmit={handleSaveNotifications}>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notificações por e-mail</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-marketing">Marketing</Label>
                        <p className="text-sm text-gray-500">Receba novidades e ofertas exclusivas</p>
                      </div>
                      <Switch id="email-marketing" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-appointments">Agendamentos</Label>
                        <p className="text-sm text-gray-500">Receba notificações sobre seus agendamentos</p>
                      </div>
                      <Switch id="email-appointments" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-updates">Atualizações da plataforma</Label>
                        <p className="text-sm text-gray-500">Saiba quando novos recursos são lançados</p>
                      </div>
                      <Switch id="email-updates" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notificações push</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-appointments">Agendamentos</Label>
                        <p className="text-sm text-gray-500">Receba alertas sobre novos agendamentos</p>
                      </div>
                      <Switch id="push-appointments" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-messages">Mensagens</Label>
                        <p className="text-sm text-gray-500">Seja notificado sobre novas mensagens</p>
                      </div>
                      <Switch id="push-messages" defaultChecked />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="notifications-form">Salvar preferências</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
