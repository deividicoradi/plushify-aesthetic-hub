import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '@/hooks/useAppointments';

// appointment_time vem do banco como "HH:MM:SS" (coluna `time`); a UI do
// resto do app (AppointmentCard) sempre exibe só "HH:MM".
export const formatAppointmentTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

export const buildReminderMessage = (appointment: Appointment): string => {
  // parseISO trata "yyyy-MM-dd" como data local; new Date() trataria como
  // UTC e a formatação em fuso negativo (Brasil) mostraria o dia anterior.
  const date = format(parseISO(appointment.appointment_date), "dd/MM/yyyy", { locale: ptBR });

  return `Olá ${appointment.client_name}! 👋

Passando pra lembrar do seu horário amanhã:
📅 Data: ${date}
⏰ Horário: ${formatAppointmentTime(appointment.appointment_time)}
✂️ Serviço: ${appointment.service_name}

Qualquer imprevisto, nos avise! Até lá 😊`;
};

// Telefone é salvo em clients.phone com formatação livre (espaços,
// parênteses, +, -). Normaliza pra só dígitos e garante o DDI 55 quando o
// número parece ser só DDD+número (10 ou 11 dígitos), sem mexer em números
// que já vierem com DDI.
export const normalizePhone = (phone?: string | null): string | null => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length >= 12 && digits.length <= 13) return digits;
  return null;
};

export const buildWhatsAppLink = (phone: string | null | undefined, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  const normalized = normalizePhone(phone);
  return normalized
    ? `https://wa.me/${normalized}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
};
