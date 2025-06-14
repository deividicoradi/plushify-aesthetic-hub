
export interface Appointment {
  id: string; // Mudou de number para string para compatibilizar com UUID do Supabase
  client: string;
  service: string;
  time: string;
  date: Date;
  status: "Confirmado" | "Pendente" | "Cancelado";
}
