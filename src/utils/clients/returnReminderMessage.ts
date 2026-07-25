// Mesmo padrão de src/utils/appointments/reminderMessage.ts (sem emoji, de
// propósito — alguns corrompem em certos apps/navegadores que abrem wa.me).
export const buildReturnReminderMessage = (clientName: string, businessName?: string | null): string => {
  const from = businessName?.trim() ? ` da ${businessName.trim()}` : '';

  return `Olá ${clientName}!

Notamos que faz um tempo desde sua última visita${from} e sentimos sua falta.

Que tal agendar um novo horário com a gente? Será um prazer te atender novamente.`;
};
