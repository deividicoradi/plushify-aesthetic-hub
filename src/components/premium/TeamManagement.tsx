
import React from 'react';
import { Users, UserPlus, Shield, Award, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const TeamManagement = () => {
  const teamMembers = [
    {
      name: 'Ana Silva',
      role: 'Gerente',
      avatar: 'AS',
      status: 'online',
      appointments: 24,
      revenue: 'R$ 3.200',
      performance: '+15%'
    },
    {
      name: 'Carlos Santos',
      role: 'Especialista',
      avatar: 'CS',
      status: 'busy',
      appointments: 18,
      revenue: 'R$ 2.400',
      performance: '+8%'
    },
    {
      name: 'Marina Costa',
      role: 'Assistente',
      avatar: 'MC',
      status: 'online',
      appointments: 12,
      revenue: 'R$ 1.600',
      performance: '+22%'
    }
  ];

  const permissions = [
    { name: 'Visualizar Dashboard', granted: true },
    { name: 'Gerenciar Clientes', granted: true },
    { name: 'Criar Agendamentos', granted: true },
    { name: 'Acessar Relatórios', granted: false },
    { name: 'Configurar Sistema', granted: false }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Gestão de Equipe
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-700">Premium</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium">Membros da Equipe ({teamMembers.length})</h3>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Membro
            </Button>
          </div>

          <div className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="p-4 border rounded-lg hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{member.appointments}</span>
                      </div>
                      <p className="text-gray-500">Agendamentos</p>
                    </div>
                    <div className="text-center">
                      <div className="text-green-600 font-medium">{member.revenue}</div>
                      <p className="text-gray-500">Receita</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>{member.performance}</span>
                      </div>
                      <p className="text-gray-500">Performance</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-600" />
            Controle de Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {permissions.map((permission, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{permission.name}</span>
                <Badge variant={permission.granted ? 'default' : 'secondary'}>
                  {permission.granted ? 'Permitido' : 'Restrito'}
                </Badge>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">
            <Shield className="w-4 h-4 mr-2" />
            Configurar Permissões
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
