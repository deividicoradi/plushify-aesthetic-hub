
import React, { useState } from 'react';
import { Calendar, Clock, User, Package, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentCard } from './AppointmentCard';

interface AppointmentsListProps {
  searchQuery: string;
}

// Mock data - will be replaced with real data from the backend
const mockAppointments = [
  {
    id: '1',
    clientName: 'Maria Silva',
    serviceName: 'Corte e Escova',
    date: '2024-06-15',
    time: '14:00',
    duration: 60,
    status: 'agendado' as const,
    price: 80.00,
    notes: 'Cliente preferencial'
  },
  {
    id: '2',
    clientName: 'Ana Costa',
    serviceName: 'Manicure',
    date: '2024-06-15',
    time: '15:30',
    duration: 45,
    status: 'confirmado' as const,
    price: 35.00,
    notes: ''
  },
  {
    id: '3',
    clientName: 'Julia Santos',
    serviceName: 'Massagem Relaxante',
    date: '2024-06-16',
    time: '09:00',
    duration: 90,
    status: 'concluido' as const,
    price: 120.00,
    notes: 'Primeira vez'
  }
];

export const AppointmentsList = ({ searchQuery }: AppointmentsListProps) => {
  const [activeTab, setActiveTab] = useState('hoje');

  const filteredAppointments = mockAppointments.filter(appointment =>
    appointment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayAppointments = filteredAppointments.filter(apt => apt.date === '2024-06-15');
  const tomorrowAppointments = filteredAppointments.filter(apt => apt.date === '2024-06-16');
  const allAppointments = filteredAppointments;

  if (filteredAppointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {searchQuery ? 'Nenhum agendamento encontrado' : 'Nenhum agendamento'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery 
            ? 'Tente buscar com outros termos ou limpe os filtros'
            : 'Comece criando seu primeiro agendamento'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hoje">Hoje ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="amanha">Amanhã ({tomorrowAppointments.length})</TabsTrigger>
          <TabsTrigger value="todos">Todos ({allAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="hoje" className="space-y-4 mt-6">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {todayAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="amanha" className="space-y-4 mt-6">
          {tomorrowAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum agendamento para amanhã</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tomorrowAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todos" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {allAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
