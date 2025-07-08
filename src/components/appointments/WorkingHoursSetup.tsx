import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Save } from 'lucide-react';
import { useWorkingHours } from '@/hooks/useWorkingHours';

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
  const { workingHours, isLoading, createOrUpdateWorkingHour } = useWorkingHours();
  const [editingHours, setEditingHours] = useState<Record<number, { start_time: string; end_time: string; is_active: boolean }>>({});

  const getWorkingHourForDay = (dayOfWeek: number) => {
    const existing = workingHours.find(wh => wh.day_of_week === dayOfWeek);
    const editing = editingHours[dayOfWeek];
    
    if (editing) return editing;
    if (existing) {
      return {
        start_time: existing.start_time,
        end_time: existing.end_time,
        is_active: existing.is_active
      };
    }
    
    return {
      start_time: '09:00',
      end_time: '18:00',
      is_active: false
    };
  };

  const updateEditingHours = (dayOfWeek: number, field: string, value: any) => {
    setEditingHours(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...getWorkingHourForDay(dayOfWeek),
        [field]: value
      }
    }));
  };

  const saveWorkingHour = async (dayOfWeek: number) => {
    const hours = getWorkingHourForDay(dayOfWeek);
    
    if (hours.start_time >= hours.end_time) {
      return;
    }

    await createOrUpdateWorkingHour({
      day_of_week: dayOfWeek,
      start_time: hours.start_time,
      end_time: hours.end_time,
      is_active: hours.is_active
    });

    // Remover do estado de edição após salvar
    setEditingHours(prev => {
      const newState = { ...prev };
      delete newState[dayOfWeek];
      return newState;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horários de Trabalho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            Carregando horários...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Horários de Trabalho
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS_OF_WEEK.map(day => {
          const hours = getWorkingHourForDay(day.value);
          const hasChanges = editingHours[day.value];
          
          return (
            <div key={day.value} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-24">
                <Label className="text-sm font-medium">{day.label}</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={hours.is_active}
                  onCheckedChange={(checked) => updateEditingHours(day.value, 'is_active', checked)}
                />
                <span className="text-sm text-muted-foreground">Ativo</span>
              </div>

              {hours.is_active && (
                <>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">De:</Label>
                    <Input
                      type="time"
                      value={hours.start_time}
                      onChange={(e) => updateEditingHours(day.value, 'start_time', e.target.value)}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Até:</Label>
                    <Input
                      type="time"
                      value={hours.end_time}
                      onChange={(e) => updateEditingHours(day.value, 'end_time', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </>
              )}

              {hasChanges && (
                <Button
                  size="sm"
                  onClick={() => saveWorkingHour(day.value)}
                  className="ml-auto"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Salvar
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};