import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Prospect, ProspectStatus } from '@/hooks/useProspects';

const STATUS_LABELS: Record<ProspectStatus, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  interessado: 'Interessado',
  negociando: 'Negociando',
  convertido: 'Convertido',
  perdido: 'Perdido',
};

const STATUS_CLASS: Record<ProspectStatus, string> = {
  novo: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  contatado: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  interessado: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  negociando: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  convertido: 'bg-emerald-600 text-white',
  perdido: 'bg-destructive/15 text-destructive',
};

interface ProspectListProps {
  prospects: Prospect[];
  loading: boolean;
  onSelect: (prospect: Prospect) => void;
}

export const ProspectList: React.FC<ProspectListProps> = ({ prospects, loading, onSelect }) => {
  if (loading) {
    return <p className="text-sm text-muted-foreground py-6 text-center">Carregando prospects...</p>;
  }

  if (prospects.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">Nenhum prospect cadastrado ainda.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último contato</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prospects.map((p) => (
            <TableRow key={p.id} role="button" className="cursor-pointer hover:bg-accent/50" onClick={() => onSelect(p)}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{p.phone || '—'}</TableCell>
              <TableCell className="capitalize">{p.origin || '—'}</TableCell>
              <TableCell>
                <Badge className={`${STATUS_CLASS[p.status]} whitespace-nowrap`}>{STATUS_LABELS[p.status]}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {p.last_contact_at ? new Date(p.last_contact_at).toLocaleDateString('pt-BR') : 'Sem contato'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
