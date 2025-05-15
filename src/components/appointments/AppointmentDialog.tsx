
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Appointment } from "@/types/appointment";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  client: z.string().min(2, "Cliente é obrigatório"),
  service: z.string().min(2, "Serviço é obrigatório"),
  time: z.string().min(1, "Horário é obrigatório"),
  date: z.date({
    required_error: "Data é obrigatória"
  }),
  status: z.enum(["Confirmado", "Pendente", "Cancelado"])
});

type FormValues = z.infer<typeof formSchema>;

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
  onSave: (appointment: Omit<Appointment, "id"> & { id?: number }) => void;
  selectedDate?: Date;
}

const AppointmentDialog = ({ 
  open, 
  onOpenChange, 
  appointment, 
  onSave,
  selectedDate 
}: AppointmentDialogProps) => {
  const isEditing = !!appointment;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: "",
      service: "",
      time: "",
      status: "Pendente" as const,
      date: selectedDate || new Date()
    }
  });

  useEffect(() => {
    if (appointment) {
      form.reset({
        client: appointment.client,
        service: appointment.service,
        time: appointment.time,
        date: appointment.date,
        status: appointment.status
      });
    } else if (selectedDate) {
      form.setValue("date", selectedDate);
    } else {
      form.reset({
        client: "",
        service: "",
        time: "",
        status: "Pendente" as const,
        date: new Date()
      });
    }
  }, [appointment, selectedDate, open, form]);

  const onSubmit = (data: FormValues) => {
    try {
      onSave(isEditing ? { ...data, id: appointment.id } : data);
      onOpenChange(false);
      toast({
        title: isEditing ? "Agendamento atualizado" : "Agendamento criado",
        description: `O agendamento foi ${isEditing ? "atualizado" : "criado"} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao ${isEditing ? "atualizar" : "criar"} o agendamento.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Tipo de serviço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Confirmado">Confirmado</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">{isEditing ? "Salvar alterações" : "Criar agendamento"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
