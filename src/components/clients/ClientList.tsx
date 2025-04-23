
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "Ativo" | "Inativo";
  lastVisit: string;
};

const allClients: Client[] = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 98765-4321",
    status: "Ativo",
    lastVisit: "15/04/2024",
  },
  {
    id: 2,
    name: "João Santos",
    email: "joao.santos@email.com",
    phone: "(11) 91234-5678",
    status: "Inativo",
    lastVisit: "01/03/2024",
  },
  {
    id: 3,
    name: "Ana Oliveira",
    email: "ana.oliveira@email.com",
    phone: "(11) 99876-5432",
    status: "Ativo",
    lastVisit: "10/04/2024",
  },
];

// Função de filtro simples para a UI
const filterClients = (
  clients: Client[],
  filters: { status: string; lastVisit: string }
) => {
  let filtered = clients;
  if (filters.status !== "Todos") {
    filtered = filtered.filter(c => c.status === filters.status);
  }
  // Filtro por visitas: apenas efeito visual/mock
  // (para produção, deve-se tratar datas!)
  if (filters.lastVisit === "Hoje") {
    // Simulando por demo
    return [];
  }
  if (filters.lastVisit === "Últimos 7 dias") {
    // Simulando por demo
    return [];
  }
  if (filters.lastVisit === "Últimos 30 dias") {
    // Simulando por demo
    return [];
  }
  return filtered;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

type Props = {
  filters: {
    status: string;
    lastVisit: string;
  };
};

const ClientList: React.FC<Props> = ({ filters }) => {
  const clients = filterClients(allClients, filters);

  return (
    <div className="rounded-md border bg-white/70 shadow animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Cliente</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última Visita</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum cliente encontrado com os filtros selecionados.</TableCell>
            </TableRow>
          )}
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-pink-50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{client.name}</span>
                </div>
              </TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    client.status === "Ativo"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell>{client.lastVisit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientList;

