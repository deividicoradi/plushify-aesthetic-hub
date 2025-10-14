
import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Save, X, MessageCircle, ArrowLeft, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { WhatsAppSettings } from '@/components/whatsapp/WhatsAppSettings';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  // Mock data - replace with actual user data
  const [profileData, setProfileData] = useState({
    name: 'João Silva',
    phone: '(11) 99999-9999',
    profession: 'Designer'
  });
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso.",
    });
    setIsEditingPassword(false);
  };

  const handleCancelPassword = () => {
    setIsEditingPassword(false);
  };

  return (
    <ResponsiveLayout
      title="Configurações"
      subtitle="Gerencie suas preferências e conta"
      icon={SettingsIcon}
    >
      <div className="space-y-6">
        {/* Back to Dashboard Button */}
        <div>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2 text-xs sm:text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
              <span className="sm:hidden">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 text-xs sm:text-sm">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Conta</span>
              <span className="sm:hidden">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2 text-xs sm:text-sm">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">Informações do Perfil</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {isEditingProfile ? 'Atualize suas informações pessoais e profissionais' : 'Visualize suas informações pessoais e profissionais'}
                      </CardDescription>
                    </div>
                  </div>
                  {!isEditingProfile && (
                    <Button
                      onClick={() => setIsEditingProfile(true)}
                      className="gap-2"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {isEditingProfile ? (
                  <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                        <Input 
                          id="name" 
                          placeholder="Seu nome completo"
                          defaultValue={profileData.name}
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
                          defaultValue={profileData.phone}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profession" className="text-sm font-medium">Profissão</Label>
                        <Input 
                          id="profession" 
                          placeholder="Sua profissão"
                          defaultValue={profileData.profession}
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                      <Button variant="outline" type="button" onClick={handleCancelProfile} className="gap-2 w-full sm:w-auto">
                        <X className="w-4 h-4" />
                        Cancelar
                      </Button>
                      <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto">
                        <Save className="w-4 h-4" />
                        Salvar alterações
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                        <p className="text-base font-medium">{profileData.name}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                        <p className="text-base font-medium">{user?.email || 'Não informado'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                        <p className="text-base font-medium">{profileData.phone || 'Não informado'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Profissão</Label>
                        <p className="text-base font-medium">{profileData.profession || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">Segurança da Conta</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Gerencie suas preferências de conta e segurança
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold">Senha</h3>
                    {!isEditingPassword && (
                      <Button
                        onClick={() => setIsEditingPassword(true)}
                        className="gap-2"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Alterar Senha</span>
                      </Button>
                    )}
                  </div>
                  
                  {isEditingPassword ? (
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
                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" onClick={handleCancelPassword} className="gap-2 w-full sm:w-auto">
                          <X className="w-4 h-4" />
                          Cancelar
                        </Button>
                        <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto">
                          <Save className="w-4 h-4" />
                          Alterar Senha
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Sua senha está protegida. Clique em "Alterar Senha" para atualizar.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Última alteração: Nunca
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <WhatsAppSettings />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default Settings;
