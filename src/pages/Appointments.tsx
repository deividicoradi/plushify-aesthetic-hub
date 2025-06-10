import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { toast } from "@/hooks/use-toast";
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentList from '@/components/appointments/AppointmentList';
import AppointmentDialog from '@/components/appointments/AppointmentDialog';
import DeleteConfirmDialog from '@/components/appointments/DeleteConfirmDialog';
import { Appointment } from '@/types/appointment';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | undefined>(undefined);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  
  // Dados de exemplo para demonstração
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      client: "Maria Silva",
      service: "Corte de Cabelo",
      time: "09:00",
      date: new Date(),
      status: "Confirmado",
    },
    {
      id: 2,
      client: "João Santos",
      service: "Manicure",
      time: "10:30",
      date: new Date(),
      status: "Pendente",
    },
    {
      id: 3,
      client: "Ana Oliveira",
      service: "Maquiagem",
      time: "14:00",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      status: "Confirmado",
    },
  ]);

  const handleCreateAppointment = () => {
    setCurrentAppointment(undefined);
    setShowAppointmentDialog(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setShowAppointmentDialog(true);
  };

  const handleDeleteAppointment = (id: number) => {
    setAppointmentToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAppointment = () => {
    if (appointmentToDelete !== null) {
      setAppointments(appointments.filter(a => a.id !== appointmentToDelete));
      setShowDeleteDialog(false);
      setAppointmentToDelete(null);
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso."
      });
    }
  };

  const handleSaveAppointment = (appointmentData: Omit<Appointment, "id"> & { id?: number }) => {
    if (appointmentData.id) {
      setAppointments(appointments.map(a => 
        a.id === appointmentData.id ? { ...appointmentData, id: a.id } as Appointment : a
      ));
    } else {
      const newId = Math.max(0, ...appointments.map(a => a.id)) + 1;
      setAppointments([...appointments, { ...appointmentData, id: newId } as Appointment]);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header with sidebar trigger */}
            <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
              <SidebarTrigger />
              <div className="flex items-center justify-between flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-plush-600" />
                  <h1 className="text-2xl font-bold">Agendamentos</h1>
                </div>
                <Button 
                  className="bg-plush-600 hover:bg-plush-700 gap-2"
                  onClick={handleCreateAppointment}
                >
                  <Plus className="h-4 w-4" />
                  Novo Agendamento
                </Button>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
                <AppointmentCalendar 
                  selectedDate={selectedDate} 
                  onDateChange={setSelectedDate} 
                />
                <AppointmentList 
                  date={selectedDate} 
                  appointments={appointments} 
                  onEdit={handleEditAppointment}
                  onDelete={handleDeleteAppointment}
                />
              </div>
            </main>

            {/* Dialogs */}
            <AppointmentDialog 
              open={showAppointmentDialog}
              onOpenChange={setShowAppointmentDialog}
              appointment={currentAppointment}
              onSave={handleSaveAppointment}
              selectedDate={selectedDate}
            />

            <DeleteConfirmDialog 
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              onConfirm={confirmDeleteAppointment}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Appointments;
