
export interface Appointment {
  id: number;
  client: string;
  service: string;
  time: string;
  date: Date;
  status: "Confirmado" | "Pendente" | "Cancelado";
}
