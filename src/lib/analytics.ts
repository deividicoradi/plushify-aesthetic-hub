// Configuração do Google Analytics 4
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Inicializar Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.log('Google Analytics ID não configurado - Analytics desabilitado');
    return;
  }

  try {
    // Verificar se já foi inicializado
    if (window.gtag && window.dataLayer) {
      console.log('Google Analytics já inicializado');
      return;
    }

    // Inicializar dataLayer primeiro
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    // Configurações de consentimento padrão
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      wait_for_update: 500,
    });

    // Carregar o script do Google Analytics de forma assíncrona
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => {
      // Configurar após carregamento
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        // Configurações de privacidade LGPD/GDPR
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        send_page_view: false, // Controle manual
        cookie_flags: 'secure;samesite=lax',
      });
    };
    script.onerror = () => {
      console.warn('Failed to load Google Analytics script');
    };
    document.head.appendChild(script);
  } catch (error) {
    console.warn('Failed to initialize Google Analytics:', error);
  }
};

// Verificar se o usuário deu consentimento
const hasAnalyticsConsent = (): boolean => {
  return localStorage.getItem('analytics_consent') === 'true';
};

// Página visitada
export const trackPageView = (path: string, title?: string) => {
  if (!GA_MEASUREMENT_ID || !hasAnalyticsConsent()) return;
  
  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });
};

// Eventos personalizados
export const trackEvent = (
  eventName: string,
  parameters?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  }
) => {
  if (!GA_MEASUREMENT_ID || !hasAnalyticsConsent()) return;
  
  window.gtag?.('event', eventName, {
    event_category: parameters?.category,
    event_label: parameters?.label,
    value: parameters?.value,
    ...parameters,
  });
};

// Eventos específicos da aplicação
export const analytics = {
  // Autenticação
  login: (method: string = 'email') => {
    trackEvent('login', {
      category: 'authentication',
      method,
    });
  },
  
  signup: (method: string = 'email') => {
    trackEvent('sign_up', {
      category: 'authentication',
      method,
    });
  },
  
  logout: () => {
    trackEvent('logout', {
      category: 'authentication',
    });
  },
  
  // Navegação
  pageView: (pageName: string, section?: string) => {
    trackEvent('page_view', {
      category: 'navigation',
      page_name: pageName,
      section,
    });
  },
  
  // Ações de negócio
  clientCreated: () => {
    trackEvent('client_created', {
      category: 'business_action',
    });
  },
  
  appointmentCreated: () => {
    trackEvent('appointment_created', {
      category: 'business_action',
    });
  },
  
  paymentCreated: (amount: number, method: string) => {
    trackEvent('payment_created', {
      category: 'business_action',
      value: amount,
      payment_method: method,
    });
  },
  
  reportGenerated: (reportType: string) => {
    trackEvent('report_generated', {
      category: 'business_action',
      report_type: reportType,
    });
  },
  
  // Engagement
  featureUsed: (featureName: string) => {
    trackEvent('feature_used', {
      category: 'engagement',
      feature_name: featureName,
    });
  },
  
  buttonClicked: (buttonName: string, location: string) => {
    trackEvent('button_click', {
      category: 'engagement',
      button_name: buttonName,
      location,
    });
  },
  
  // Errors
  errorOccurred: (errorType: string, errorMessage: string) => {
    trackEvent('exception', {
      category: 'error',
      description: errorMessage,
      fatal: false,
      error_type: errorType,
    });
  },
  
  // Conversões
  subscriptionStarted: (planType: string) => {
    trackEvent('subscription_started', {
      category: 'conversion',
      plan_type: planType,
    });
  },
  
  trialStarted: () => {
    trackEvent('trial_started', {
      category: 'conversion',
    });
  },
};

// Configurar consentimento
export const setAnalyticsConsent = (consent: boolean) => {
  localStorage.setItem('analytics_consent', consent.toString());
  
  if (consent) {
    // Se consentimento foi dado, inicializar GA
    initGA();
  } else {
    // Se consentimento foi negado, limpar dados
    window.gtag?.('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
    });
  }
};

// Declarações TypeScript para window.gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}