
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Save, X, ArrowLeft, Edit, Link2, Copy, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, saveProfile } = useProfile();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [professionInput, setProfessionInput] = useState('');

  useEffect(() => {
    setNameInput(profile.name ?? '');
    setPhoneInput(profile.phone ?? '');
    setProfessionInput(profile.profession ?? '');
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const ok = await saveProfile({ name: nameInput, phone: phoneInput, profession: professionInput });
      if (ok) setIsEditingProfile(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setNameInput(profile.name ?? '');
    setPhoneInput(profile.phone ?? '');
    setProfessionInput(profile.profession ?? '');
    setIsEditingProfile(false);
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [lastPasswordChange, setLastPasswordChange] = useState<string | null>(null);

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Senha muito curta", description: "A nova senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Senhas não conferem", description: "A confirmação não é igual à nova senha.", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      // Não existe API do Supabase pra "verificar a senha atual" isoladamente;
      // reautenticar com signInWithPassword é a forma correta de confirmar
      // que quem está trocando a senha realmente sabe a senha atual.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (verifyError) {
        toast({ title: "Senha atual incorreta", description: "Verifique a senha atual e tente novamente.", variant: "destructive" });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        toast({ title: "Erro ao alterar senha", description: updateError.message, variant: "destructive" });
        return;
      }

      setLastPasswordChange(new Date().toISOString());
      toast({ title: "Senha alterada", description: "Sua senha foi alterada com sucesso." });
      resetPasswordForm();
      setIsEditingPassword(false);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPassword = () => {
    resetPasswordForm();
    setIsEditingPassword(false);
  };

  // Slug opaco, sem relação com o user_id interno — gerado e persistido no
  // banco (get_or_create_booking_slug), não é calculado aqui no front.
  const [bookingSlug, setBookingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    supabase.rpc('get_or_create_booking_slug').then(({ data, error }) => {
      if (error) {
        console.error('Erro ao obter link de agendamento:', error);
        return;
      }
      setBookingSlug(data as string);
    });
  }, [user?.id]);

  const bookingLink = bookingSlug ? `${window.location.origin}/agendar/${bookingSlug}` : '';

  const handleCopyBookingLink = async () => {
    if (!bookingLink) return;
    await navigator.clipboard.writeText(bookingLink);
    toast({
      title: "Link copiado",
      description: "Envie esse link para seus clientes agendarem direto com você.",
    });
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
          <TabsList className="grid w-full grid-cols-2">
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
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
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
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profession" className="text-sm font-medium">Profissão</Label>
                        <Input
                          id="profession"
                          placeholder="Sua profissão"
                          value={professionInput}
                          onChange={(e) => setProfessionInput(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                      <Button variant="outline" type="button" onClick={handleCancelProfile} disabled={savingProfile} className="gap-2 w-full sm:w-auto">
                        <X className="w-4 h-4" />
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={savingProfile} className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto">
                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar alterações
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                        <p className="text-base font-medium">{profile.name || 'Não informado'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                        <p className="text-base font-medium">{user?.email || 'Não informado'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                        <p className="text-base font-medium">{profile.phone || 'Não informado'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Profissão</Label>
                        <p className="text-base font-medium">{profile.profession || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Link2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Link de agendamento</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Envie esse link para seus clientes marcarem horário direto com você
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input value={bookingLink || 'Gerando link...'} readOnly className="text-sm" />
                  <Button onClick={handleCopyBookingLink} disabled={!bookingLink} className="gap-2 shrink-0">
                    <Copy className="w-4 h-4" />
                    Copiar link
                  </Button>
                </div>
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
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          disabled={changingPassword}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={changingPassword}
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={changingPassword}
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" onClick={handleCancelPassword} disabled={changingPassword} className="gap-2 w-full sm:w-auto">
                          <X className="w-4 h-4" />
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={changingPassword} className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto">
                          {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
                        Última alteração: {lastPasswordChange
                          ? new Date(lastPasswordChange).toLocaleString('pt-BR')
                          : 'Nunca nesta sessão'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
};

export default Settings;
