
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AppointmentList = () => {
  const appointments = [
    {
      id: 1,
      client: "Maria Silva",
      service: "Corte de Cabelo",
      time: "09:00",
      status: "Confirmado",
    },
    {
      id: 2,
      client: "João Santos",
      service: "Manicure",
      time: "10:30",
      status: "Pendente",
    },
    {
      id: 3,
      client: "Ana Oliveira",
      service: "Maquiagem",
      time: "14:00",
      status: "Confirmado",
    },
  ];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.client}</TableCell>
              <TableCell>{appointment.service}</TableCell>
              <TableCell>{appointment.time}</TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                  appointment.status === "Confirmado" 
                    ? "bg-green-50 text-green-700" 
                    : "bg-yellow-50 text-yellow-700"
                )}>
                  {appointment.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppointmentList;
