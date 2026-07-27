import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'plushify_sidebar_collapsed';

// Estado simples em localStorage (não precisa de contexto/backend — é só
// preferência de UI do dispositivo) compartilhado entre DashboardSidebar
// (decide o que renderizar) e ResponsiveLayout (decide a margem do conteúdo),
// sincronizado via evento customizado pra ambos reagirem ao mesmo toggle.
const EVENT_NAME = 'plushify:sidebar-collapsed-change';

const readStored = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const useSidebarCollapsed = () => {
  const [collapsed, setCollapsed] = useState<boolean>(readStored);

  useEffect(() => {
    const handler = () => setCollapsed(readStored());
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const toggle = useCallback(() => {
    const next = !readStored();
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // localStorage indisponível (modo privado etc.) — segue só em memória
    }
    setCollapsed(next);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return { collapsed, toggle };
};
