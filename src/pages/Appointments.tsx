import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentList from '@/components/appointments/AppointmentList';
import AppointmentDialog from '@/components/appointments/AppointmentDialog';
import DeleteConfirmDialog from '@/components/appointments/DeleteConfirmDialog';
import { Appointment } from '@/types/appointment';
import { useAppointments } from '@/hooks/useAppointments';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | undefined>(undefined);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  
  const {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment
  } = useAppointments();

  const handleCreateAppointment = () => {
    setCurrentAppointment(undefined);
    setShowAppointmentDialog(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setShowAppointmentDialog(true);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointmentToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAppointment = async () => {
    if (appointmentToDelete !== null) {
      await deleteAppointment(appointmentToDelete);
      setShowDeleteDialog(false);
      setAppointmentToDelete(null);
    }
  };

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, "id"> & { id?: string }) => {
    try {
      console.log('Salvando agendamento:', appointmentData);
      
      if (appointmentData.id) {
        await updateAppointment(appointmentData.id, appointmentData);
      } else {
        await createAppointment(appointmentData);
      }
      
      setShowAppointmentDialog(false);
      setCurrentAppointment(undefined);
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      // O erro já é tratado no hook useAppointments
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
                  loading={loading}
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
