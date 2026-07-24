import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const STAFF_PERMISSIONS = [
  'manage_appointments',
  'manage_clients',
  'manage_inventory',
  'view_financial',
  'view_reports',
] as const;

export type StaffPermissionKey = typeof STAFF_PERMISSIONS[number];

export const STAFF_PERMISSION_LABELS: Record<StaffPermissionKey, string> = {
  manage_appointments: 'Criar/editar agendamentos',
  manage_clients: 'Criar/editar clientes',
  manage_inventory: 'Criar/editar produtos do estoque',
  view_financial: 'Ver módulo Financeiro',
  view_reports: 'Ver Relatórios',
};

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  permissions: Partial<Record<StaffPermissionKey, boolean>>;
}

interface StaffModeContextValue {
  isStaffMode: boolean;
  activeMember: StaffMember | null;
  enterStaffMode: (member: StaffMember) => void;
  exitStaffMode: () => void;
  can: (permission: StaffPermissionKey) => boolean;
}

const StaffModeContext = createContext<StaffModeContextValue | undefined>(undefined);

const storageKey = (userId?: string) => `plushify_staff_mode_${userId ?? 'anon'}`;

export const StaffModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeMember, setActiveMember] = useState<StaffMember | null>(null);

  // Carrega o modo funcionário salvo nesta aba (sessionStorage — some ao
  // fechar a aba/navegador, apropriado pra um dispositivo compartilhado).
  useEffect(() => {
    if (!user?.id) {
      setActiveMember(null);
      return;
    }
    try {
      const raw = sessionStorage.getItem(storageKey(user.id));
      setActiveMember(raw ? JSON.parse(raw) : null);
    } catch {
      setActiveMember(null);
    }
  }, [user?.id]);

  const enterStaffMode = useCallback((member: StaffMember) => {
    if (!user?.id) return;
    sessionStorage.setItem(storageKey(user.id), JSON.stringify(member));
    setActiveMember(member);
  }, [user?.id]);

  const exitStaffMode = useCallback(() => {
    if (user?.id) sessionStorage.removeItem(storageKey(user.id));
    setActiveMember(null);
  }, [user?.id]);

  const can = useCallback((permission: StaffPermissionKey) => {
    if (!activeMember) return true; // sessão do dono — sem restrição
    return activeMember.permissions?.[permission] === true;
  }, [activeMember]);

  return (
    <StaffModeContext.Provider
      value={{ isStaffMode: !!activeMember, activeMember, enterStaffMode, exitStaffMode, can }}
    >
      {children}
    </StaffModeContext.Provider>
  );
};

export const useStaffMode = (): StaffModeContextValue => {
  const ctx = useContext(StaffModeContext);
  if (!ctx) throw new Error('useStaffMode deve ser usado dentro de StaffModeProvider');
  return ctx;
};
