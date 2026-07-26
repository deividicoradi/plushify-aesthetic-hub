import React, { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useProfessionals } from '@/hooks/useProfessionals';
import type { Appointment } from '@/hooks/useAppointments';
import { AppointmentCard } from './AppointmentCard';
import { cn } from '@/lib/utils';

interface AppointmentsTimelineProps {
  appointments: Appointment[];
  selectedAppointments?: string[];
  onSelectAppointment?: (appointmentId: string, checked: boolean) => void;
}

const statusBlockColors: Record<Appointment['status'], string> = {
  agendado: 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900',
  confirmado: 'bg-emerald-100 border-emerald-300 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900',
  concluido: 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
  cancelado: 'bg-red-100 border-red-300 text-red-900 hover:bg-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900',
};

const PIXELS_PER_MINUTE = 1.4;
const MIN_BLOCK_HEIGHT = 34;
const ABSOLUTE_MIN_HOUR = 6;
const ABSOLUTE_MAX_HOUR = 22;
const PADDING_MINUTES = 60;

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

interface PositionedAppointment {
  appointment: Appointment;
  startMinutes: number;
  endMinutes: number;
  columnIndex: number;
  columnCount: number;
}

const layoutOverlaps = (appointments: Appointment[]): PositionedAppointment[] => {
  const sorted = [...appointments].sort((a, b) => toMinutes(a.appointment_time) - toMinutes(b.appointment_time));
  const positioned: PositionedAppointment[] = sorted.map(appointment => ({
    appointment,
    startMinutes: toMinutes(appointment.appointment_time),
    endMinutes: toMinutes(appointment.appointment_time) + appointment.duration,
    columnIndex: 0,
    columnCount: 1,
  }));

  // Agrupa em clusters de horários que se sobrepõem entre si, e dentro de
  // cada cluster distribui os agendamentos lado a lado (colunas).
  let clusterStart = 0;
  while (clusterStart < positioned.length) {
    let clusterEnd = clusterStart;
    let maxEndInCluster = positioned[clusterStart].endMinutes;
    while (
      clusterEnd + 1 < positioned.length &&
      positioned[clusterEnd + 1].startMinutes < maxEndInCluster
    ) {
      clusterEnd += 1;
      maxEndInCluster = Math.max(maxEndInCluster, positioned[clusterEnd].endMinutes);
    }

    const cluster = positioned.slice(clusterStart, clusterEnd + 1);
    const columnEnds: number[] = [];
    for (const item of cluster) {
      let col = columnEnds.findIndex(end => end <= item.startMinutes);
      if (col === -1) {
        col = columnEnds.length;
        columnEnds.push(item.endMinutes);
      } else {
        columnEnds[col] = item.endMinutes;
      }
      item.columnIndex = col;
    }
    const columnCount = columnEnds.length;
    cluster.forEach(item => { item.columnCount = columnCount; });

    clusterStart = clusterEnd + 1;
  }

  return positioned;
};

const AppointmentBlock = ({ item, dayStartMinutes }: { item: PositionedAppointment; dayStartMinutes: number }) => {
  const { appointment, startMinutes, endMinutes, columnIndex, columnCount } = item;
  const top = (startMinutes - dayStartMinutes) * PIXELS_PER_MINUTE;
  const height = Math.max((endMinutes - startMinutes) * PIXELS_PER_MINUTE, MIN_BLOCK_HEIGHT);
  const widthPct = 100 / columnCount;
  const leftPct = widthPct * columnIndex;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'absolute rounded-md border px-2 py-1 text-left text-xs leading-tight overflow-hidden transition-colors',
            statusBlockColors[appointment.status]
          )}
          style={{
            top,
            height,
            left: `calc(${leftPct}% + 2px)`,
            width: `calc(${widthPct}% - 4px)`,
          }}
        >
          <p className="font-semibold truncate">
            {formatMinutes(startMinutes)}-{formatMinutes(endMinutes)}
          </p>
          <p className="truncate">{appointment.client_name}</p>
          {height > MIN_BLOCK_HEIGHT + 14 && (
            <p className="truncate opacity-80">{appointment.service_name}</p>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <AppointmentCard appointment={appointment} />
      </PopoverContent>
    </Popover>
  );
};

export const AppointmentsTimeline = ({ appointments }: AppointmentsTimelineProps) => {
  const { professionals } = useProfessionals();

  const { dayStartMinutes, dayEndMinutes, hourMarks } = useMemo(() => {
    if (appointments.length === 0) {
      return {
        dayStartMinutes: ABSOLUTE_MIN_HOUR * 60,
        dayEndMinutes: ABSOLUTE_MAX_HOUR * 60,
        hourMarks: [] as number[],
      };
    }

    const starts = appointments.map(a => toMinutes(a.appointment_time));
    const ends = appointments.map(a => toMinutes(a.appointment_time) + a.duration);

    const start = Math.max(0, Math.min(...starts) - PADDING_MINUTES);
    const end = Math.min(24 * 60, Math.max(...ends) + PADDING_MINUTES);

    const boundedStart = Math.min(start, ABSOLUTE_MIN_HOUR * 60);
    const boundedEnd = Math.max(end, ABSOLUTE_MAX_HOUR * 60);

    const marks: number[] = [];
    const firstHour = Math.floor(boundedStart / 60);
    const lastHour = Math.ceil(boundedEnd / 60);
    for (let h = firstHour; h <= lastHour; h++) {
      marks.push(h * 60);
    }

    return { dayStartMinutes: boundedStart, dayEndMinutes: boundedEnd, hourMarks: marks };
  }, [appointments]);

  const columns = useMemo(() => {
    const byProfessional = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      const key = appointment.professional_id || '__none__';
      if (!byProfessional.has(key)) byProfessional.set(key, []);
      byProfessional.get(key)!.push(appointment);
    }

    const professionalNameById = new Map(professionals.map(p => [p.id, p.name]));

    const result = Array.from(byProfessional.entries()).map(([professionalId, appts]) => ({
      professionalId,
      name: professionalId === '__none__' ? 'Sem profissional definido' : (professionalNameById.get(professionalId) || 'Profissional'),
      items: layoutOverlaps(appts),
    }));

    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [appointments, professionals]);

  const timelineHeight = (dayEndMinutes - dayStartMinutes) * PIXELS_PER_MINUTE;
  const showColumnHeaders = columns.length > 1;

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum agendamento neste dia</p>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto border rounded-lg bg-background">
      {/* Régua de horários */}
      <div className="shrink-0 w-14 border-r bg-muted/30 relative" style={{ height: timelineHeight + (showColumnHeaders ? 40 : 0) }}>
        {showColumnHeaders && <div className="h-10 border-b" />}
        {hourMarks.map(mark => (
          <div
            key={mark}
            className="absolute -translate-y-1/2 pr-2 text-right w-full text-[11px] text-muted-foreground"
            style={{ top: (mark - dayStartMinutes) * PIXELS_PER_MINUTE + (showColumnHeaders ? 40 : 0) }}
          >
            {formatMinutes(mark)}
          </div>
        ))}
      </div>

      {/* Colunas por profissional */}
      <div className="flex flex-1">
        {columns.map(column => (
          <div
            key={column.professionalId}
            className="relative border-r last:border-r-0 min-w-[220px] flex-1"
          >
            {showColumnHeaders && (
              <div className="h-10 border-b flex items-center px-3 text-sm font-medium truncate bg-muted/20 sticky top-0">
                {column.name}
              </div>
            )}
            <div
              className="relative"
              style={{ height: timelineHeight, marginTop: showColumnHeaders ? 0 : 0 }}
            >
              {hourMarks.map(mark => (
                <div
                  key={mark}
                  className="absolute w-full border-t border-dashed border-muted-foreground/20"
                  style={{ top: (mark - dayStartMinutes) * PIXELS_PER_MINUTE }}
                />
              ))}
              {column.items.map(item => (
                <AppointmentBlock key={item.appointment.id} item={item} dayStartMinutes={dayStartMinutes} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
