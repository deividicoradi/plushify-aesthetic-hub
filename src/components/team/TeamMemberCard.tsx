import React from 'react';
import { MoreVertical, Edit, Trash2, User, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMember } from '@/hooks/useTeamMembers';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

const formatSalary = (salary?: number) => {
  if (!salary) return 'Não informado';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(salary);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Não informado';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    gerente: 'Gerente',
    especialista: 'Especialista',
    assistente: 'Assistente',
    recepcionista: 'Recepcionista',
    estagiario: 'Estagiário',
  };
  return roleMap[role] || role;
};

const getStatusBadge = (status: string) => {
  return status === 'active' ? (
    <Badge variant="default" className="bg-green-100 text-green-800">
      Ativo
    </Badge>
  ) : (
    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
      Inativo
    </Badge>
  );
};

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onEdit,
  onDelete,
}) => {
  const initials = member.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-lg truncate">{member.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {getRoleLabel(member.role)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {getStatusBadge(member.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(member)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(member.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {member.email && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          
          {member.phone && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
              <span>{member.phone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
            <span>Contratado em: {formatDate(member.hire_date)}</span>
          </div>
          
          {member.salary && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
              <span>{formatSalary(member.salary)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};