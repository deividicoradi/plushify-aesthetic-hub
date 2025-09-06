import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Clock, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { useWorkingHoursEnhanced } from '@/hooks/useWorkingHoursEnhanced';
import { toast } from '@/hooks/use-toast';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

export const WorkingHoursSetup = () => {
  const { 
    workingHours, 
    isLoading, 
    saveAllWorkingHours, 
    checkPendingAppointments 
  } = useWorkingHoursEnhanced();
  
  const [editedHours, setEditedHours] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (workingHours.length > 0) {
      setEditedHours([...workingHours]);
    }
  }, [workingHours]);

  const updateHour = (index: number, field: string, value: any) => {
    const newEditedHours = [...editedHours];
    newEditedHours[index] = {
      ...newEditedHours[index],
      [field]: value
    };
    setEditedHours(newEditedHours);
    setHasChanges(true);
  };

  const handleToggleActive = async (index: number, checked: boolean) => {
    if (!checked) {
      // Verificar se há agendamentos pendentes antes de desativar
      const dayOfWeek = editedHours[index].day_of_week;
      const hasPending = await checkPendingAppointments(dayOfWeek);
      
      if (hasPending) {
        toast({
          title: "Não é possível desativar",
          description: "Não é possível desativar o dia de trabalho com agendamentos pendentes.",
          variant: "destructive"
        });
        return;
      }
    }
    
    updateHour(index, 'is_active', checked);
  };

  const handleSaveAll = async () => {
    // Validações
    for (const hour of editedHours) {
      if (hour.is_active && hour.start_time >= hour.end_time) {
        toast({
          title: "Erro de validação",
          description: `O horário de início deve ser menor que o horário de fim para ${DAYS_OF_WEEK.find(d => d.value === hour.day_of_week)?.label}`,
          variant: "destructive"
        });
        return;
      }
    }

    const success = await saveAllWorkingHours(editedHours);
    if (success) {
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configurações de Horário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            Carregando configurações...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Configurações de Horário
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configurações Globais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Configurações Gerais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Confirmar agendamentos automaticamente</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Aprovar agendamentos dentro do horário de trabalho
                </p>
              </div>
              <Switch
                checked={editedHours.some(h => h.auto_confirm_appointments)}
                onCheckedChange={(checked) => {
                  const newEditedHours = editedHours.map(h => ({
                    ...h,
                    auto_confirm_appointments: checked
                  }));
                  setEditedHours(newEditedHours);
                  setHasChanges(true);
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Concluir agendamentos automaticamente</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Finalizar agendamentos confirmados às 23:00
                </p>
              </div>
              <Switch
                checked={editedHours.some(h => h.auto_complete_appointments)}
                onCheckedChange={(checked) => {
                  const newEditedHours = editedHours.map(h => ({
                    ...h,
                    auto_complete_appointments: checked
                  }));
                  setEditedHours(newEditedHours);
                  setHasChanges(true);
                }}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Horários por Dia */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Horários de Trabalho
          </h3>
          
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day, index) => {
              const hour = editedHours.find(h => h.day_of_week === day.value) || {
                day_of_week: day.value,
                start_time: '09:00',
                end_time: '18:00',
                is_active: false,
                auto_confirm_appointments: false,
                auto_complete_appointments: false
              };
              
              const hourIndex = editedHours.findIndex(h => h.day_of_week === day.value);
              
              return (
                <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-32">
                    <Label className="text-sm font-medium">{day.label}</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={hour.is_active}
                      onCheckedChange={(checked) => handleToggleActive(hourIndex >= 0 ? hourIndex : editedHours.length, checked)}
                    />
                    <span className="text-sm text-muted-foreground">Ativo</span>
                  </div>

                  {hour.is_active && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">De:</Label>
                        <Input
                          type="time"
                          value={hour.start_time}
                          onChange={(e) => updateHour(hourIndex, 'start_time', e.target.value)}
                          className="w-32"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Até:</Label>
                        <Input
                          type="time"
                          value={hour.end_time}
                          onChange={(e) => updateHour(hourIndex, 'end_time', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </>
                  )}

                  <div className="ml-auto">
                    {hour.is_active ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botão de Salvar Global */}
        {hasChanges && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSaveAll} className="gap-2">
              <Save className="w-4 h-4" />
              Salvar Todas as Configurações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};