export type ProspectStatus = 'novo' | 'contatado' | 'interessado' | 'negociando' | 'convertido' | 'perdido';
export type ProspectOrigin = 'instagram' | 'facebook' | 'whatsapp' | 'indicacao' | 'google' | 'evento' | 'porta' | 'outro';
export type ContactChannel = 'whatsapp' | 'instagram' | 'telefone' | 'presencial' | 'email' | 'outro';
export type PlanInterest = 'professional' | 'premium' | 'indefinido';

export type Prospect = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  origin: ProspectOrigin | null;
  contact_channel: ContactChannel | null;
  plan_interest: PlanInterest | null;
  estimated_value: number | null;
  status: ProspectStatus;
  loss_reason: string | null;
  next_action_note: string | null;
  next_action_date: string | null;
  last_contact_at: string | null;
  converted_user_id: string | null;
  converted_user_email: string | null;
  converted_at: string | null;
  first_payment_value: number | null;
  notes: string | null;
  prospector_id: string | null;
  prospector_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Prospector = {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
};

export type ProspectorStats = {
  prospector_id: string;
  prospector_name: string;
  total_prospected: number;
  total_converted: number;
  total_lost: number;
  conversion_rate: number;
};

export type ProspectInteraction = {
  id: string;
  prospect_id: string;
  channel: ContactChannel;
  note: string | null;
  occurred_at: string;
  created_at: string;
};

export type ProspectMetrics = {
  total_prospected: number;
  total_converted: number;
  total_lost: number;
  total_open: number;
  conversion_rate: number;
  loss_rate: number;
};

export type StaleProspect = {
  id: string;
  name: string;
  phone: string | null;
  status: ProspectStatus;
  last_contact_at: string | null;
  days_since_contact: number;
  urgency: 'atencao' | 'critico';
};

export const ORIGIN_LABELS: Record<ProspectOrigin, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  indicacao: 'Indicação',
  google: 'Google',
  evento: 'Evento',
  porta: 'Passou na porta',
  outro: 'Outro',
};

export const CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  telefone: 'Telefone',
  presencial: 'Presencial',
  email: 'E-mail',
  outro: 'Outro',
};

export const PLAN_INTEREST_LABELS: Record<PlanInterest, string> = {
  professional: 'Profissional',
  premium: 'Premium',
  indefinido: 'Ainda indefinido',
};

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  interessado: 'Interessado',
  negociando: 'Negociando',
  convertido: 'Convertido',
  perdido: 'Perdido',
};

export const STATUS_CLASS: Record<ProspectStatus, string> = {
  novo: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  contatado: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  interessado: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  negociando: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  convertido: 'bg-emerald-600 text-white',
  perdido: 'bg-destructive/15 text-destructive',
};
