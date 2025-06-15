
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Star } from 'lucide-react';
import { ClientROI } from '@/hooks/analytics/useClientROI';

interface ClientROITableProps {
  data: ClientROI[];
  loading?: boolean;
}

export const ClientROITable = ({ data, loading }: ClientROITableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getROIBadge = (score: number) => {
    if (score >= 1000) return { variant: 'default' as const, label: 'VIP' };
    if (score >= 500) return { variant: 'secondary' as const, label: 'Premium' };
    if (score >= 200) return { variant: 'outline' as const, label: 'Regular' };
    return { variant: 'destructive' as const, label: 'Novo' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            ROI por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          ROI por Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Total Gasto</TableHead>
              <TableHead className="text-right">Visitas</TableHead>
              <TableHead className="text-right">Ticket Médio</TableHead>
              <TableHead className="text-right">Lifetime Value</TableHead>
              <TableHead className="text-right">Última Visita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((client, index) => {
              const roiBadge = getROIBadge(client.roi_score);
              return (
                <TableRow key={client.client_name}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index < 3 && <Star className="w-4 h-4 text-yellow-500" />}
                      <span className="font-medium">{client.client_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roiBadge.variant}>
                      {roiBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(client.total_spent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {client.total_appointments}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(client.average_per_visit)}
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-semibold">
                    {formatCurrency(client.lifetime_value)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(client.last_visit)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado de cliente encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
