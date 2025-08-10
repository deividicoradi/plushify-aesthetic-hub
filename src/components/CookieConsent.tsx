import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Cookie, Shield, BarChart3, Settings, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { setAnalyticsConsent } from '@/lib/analytics';
import { Link } from 'react-router-dom';

interface CookieConsentProps {
  onConsentChange?: (consent: boolean) => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onConsentChange }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsConsent, setAnalyticsConsentState] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    // Verificar se já existe consentimento
    const existingConsent = localStorage.getItem('cookie_consent_given');
    const analyticsConsent = localStorage.getItem('analytics_consent') === 'true';
    
    if (!existingConsent) {
      setShowBanner(true);
    }
    
    setAnalyticsConsentState(analyticsConsent);
  }, []);

  const handleAcceptAll = () => {
    setAnalyticsConsentState(true);
    setMarketingConsent(true);
    saveConsent(true, true);
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    setAnalyticsConsentState(false);
    setMarketingConsent(false);
    saveConsent(false, false);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveConsent(analyticsConsent, marketingConsent);
    setShowSettings(false);
    setShowBanner(false);
  };

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    localStorage.setItem('cookie_consent_given', 'true');
    localStorage.setItem('analytics_consent', analytics.toString());
    localStorage.setItem('marketing_consent', marketing.toString());
    
    // Configurar Google Analytics
    setAnalyticsConsent(analytics);
    
    onConsentChange?.(analytics);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner de Consentimento */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <Card className="mx-auto max-w-4xl border-2 shadow-2xl bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">
                  Respeitamos sua Privacidade
                </CardTitle>
                <CardDescription className="text-sm">
                  Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo. 
                  Você pode escolher quais cookies aceitar. Seus dados são tratados conforme nossa{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Política de Privacidade
                  </Link>{' '}
                  e a{' '}
                  <Link to="/lgpd" className="text-primary hover:underline">
                    LGPD
                  </Link>.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="order-3 sm:order-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Personalizar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptEssential}
                className="order-2"
              >
                Apenas Essenciais
              </Button>
              
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="order-1 sm:order-3"
              >
                Aceitar Todos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Configurações Detalhadas */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações de Privacidade
            </DialogTitle>
            <DialogDescription>
              Gerencie suas preferências de cookies e privacidade. Você pode alterar essas configurações a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Cookies Essenciais */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Cookies Essenciais</h4>
                  <Badge variant="secondary">Sempre Ativo</Badge>
                </div>
                <Switch checked disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                Necessários para o funcionamento básico do site. Incluem autenticação, 
                preferências de tema e funcionalidades de segurança.
              </p>
            </div>

            {/* Cookies de Analytics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <h4 className="font-medium">Analytics e Performance</h4>
                  <Badge variant="outline">Opcional</Badge>
                </div>
                <Switch
                  checked={analyticsConsent}
                  onCheckedChange={setAnalyticsConsentState}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Nos ajudam a entender como você usa o site para melhorar a experiência. 
                Dados anonimizados via Google Analytics 4.
              </p>
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                <strong>Dados coletados:</strong> Páginas visitadas, tempo de sessão, 
                cliques em botões, erros encontrados. Todos os dados são anonimizados 
                e não identificam você pessoalmente.
              </div>
            </div>

            {/* Cookies de Marketing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <h4 className="font-medium">Marketing e Personalização</h4>
                  <Badge variant="outline">Opcional</Badge>
                </div>
                <Switch
                  checked={marketingConsent}
                  onCheckedChange={setMarketingConsent}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Usados para personalizar conteúdo e anúncios relevantes. 
                Atualmente não utilizamos, mas podem ser implementados no futuro.
              </p>
            </div>

            {/* Links Legais */}
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-medium text-sm">Documentos Legais</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
                <Link to="/lgpd" className="text-primary hover:underline">
                  LGPD
                </Link>
                <Link to="/cookies" className="text-primary hover:underline">
                  Política de Cookies
                </Link>
                <Link to="/terms" className="text-primary hover:underline">
                  Termos de Uso
                </Link>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSavePreferences}>
              Salvar Preferências
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};