
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentListProps {
  date: Date | undefined;
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

const AppointmentList = ({ date, appointments, onEdit, onDelete, loading = false }: AppointmentListProps) => {
  const filteredAppointments = date 
    ? appointments.filter(appointment => 
        appointment.date.toDateString() === date.toDateString())
    : appointments;

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Carregando agendamentos...</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="p-4 border-b">
        <h3 className="font-medium">
          {date 
            ? `Agendamentos para ${format(date, "dd 'de' MMMM", { locale: ptBR })}` 
            : "Todos os Agendamentos"}
        </h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAppointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                Nenhum agendamento encontrado para esta data
              </TableCell>
            </TableRow>
          ) : (
            filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id} className="group">
                <TableCell>{appointment.client}</TableCell>
                <TableCell>{appointment.service}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    appointment.status === "Confirmado" 
                      ? "bg-green-50 text-green-700" 
                      : appointment.status === "Cancelado"
                      ? "bg-red-50 text-red-700"
                      : "bg-yellow-50 text-yellow-700"
                  )}>
                    {appointment.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(appointment)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(appointment.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppointmentList;
