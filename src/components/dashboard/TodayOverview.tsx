import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowUpRight, Plus, CheckCircle2, CircleDot } from 'lucide-react';
import { useAppointments, Appointment } from '@/hooks/useAppointments';

const isSameDay = (iso: string, ref: Date) => {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
};

const formatHour = (time?: string) => (time ? time.slice(0, 5) : '--:--');

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const statusStyles: Record<Appointment['status'], { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  agendado: { label: 'Agendado', cls: 'text-amber-300 bg-amber-300/10', Icon: CircleDot },
  confirmado: { label: 'Confirmado', cls: 'text-[#D65E9A] bg-[#D65E9A]/15', Icon: CircleDot },
  concluido: { label: 'Concluído', cls: 'text-emerald-400 bg-emerald-400/10', Icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', cls: 'text-rose-400 bg-rose-400/10', Icon: CircleDot },
};

export const TodayOverview = () => {
  const navigate = useNavigate();
  const { appointments, isLoading } = useAppointments();

  const today = new Date();
  const todayLabel = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  const { todays, upcoming, doneToday, revenueToday, nextAppt } = useMemo(() => {
    const list = (appointments || []) as Appointment[];
    const todays = list
      .filter((a) => a.appointment_date && isSameDay(a.appointment_date, today))
      .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''));

    const now = new Date();
    const upcoming = todays.filter((a) => {
      if (a.status === 'cancelado' || a.status === 'concluido') return false;
      const [h, m] = (a.appointment_time || '00:00').split(':').map(Number);
      const t = new Date();
      t.setHours(h || 0, m || 0, 0, 0);
      return t.getTime() >= now.getTime() - 30 * 60_000;
    });

    const doneToday = todays.filter((a) => a.status === 'concluido').length;
    const revenueToday = todays
      .filter((a) => a.status !== 'cancelado')
      .reduce((sum, a) => sum + (a.price || 0), 0);
    const nextAppt = upcoming[0];

    return { todays, upcoming, doneToday, revenueToday, nextAppt };
  }, [appointments]);

  return (
    <div className="relative overflow-hidden bg-[#1a1322] border border-white/5 rounded-3xl p-6 md:p-8">
      <div className="absolute top-0 right-0 w-56 h-56 bg-[#D65E9A]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#D65E9A] text-xs font-semibold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            Hoje
          </div>
          <h2 className="text-white text-lg md:text-xl font-bold font-[Sora,system-ui,sans-serif] mt-1 capitalize">
            {todayLabel}
          </h2>
          <p className="text-gray-400 text-xs mt-1">Sua agenda e desempenho do dia</p>
        </div>
        <button
          onClick={() => navigate('/appointments')}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#D65E9A] hover:bg-[#c44d87] text-white transition-all shadow-lg shadow-[#D65E9A]/20"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo
        </button>
      </div>

      {/* Quick stats */}
      <div className="relative grid grid-cols-3 gap-3 mb-6">
        <Stat label="Marcados" value={todays.length} />
        <Stat label="Concluídos" value={doneToday} accent />
        <Stat label="Receita" value={formatCurrency(revenueToday)} small />
      </div>

      {/* Next appointment highlight */}
      {nextAppt ? (
        <button
          onClick={() => navigate('/appointments')}
          className="relative w-full text-left mb-4 p-4 rounded-2xl bg-gradient-to-br from-[#D65E9A]/15 via-[#2a1a2e] to-transparent border border-[#D65E9A]/25 hover:border-[#D65E9A]/50 transition-colors group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-[#D65E9A] font-semibold">Próximo</p>
              <p className="text-white font-semibold truncate mt-0.5">{nextAppt.client_name}</p>
              <p className="text-gray-400 text-xs truncate">{nextAppt.service_name}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <p className="text-white font-bold tabular-nums font-[Sora,system-ui,sans-serif]">
                  {formatHour(nextAppt.appointment_time)}
                </p>
                <p className="text-gray-500 text-[10px]">{nextAppt.duration} min</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#D65E9A] opacity-60 group-hover:opacity-100 transition" />
            </div>
          </div>
        </button>
      ) : null}

      {/* Schedule list */}
      <div className="relative space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Agenda do dia</h3>
          <button
            onClick={() => navigate('/appointments')}
            className="text-xs text-[#D65E9A] hover:underline font-medium"
          >
            Ver tudo
          </button>
        </div>

        {isLoading ? (
          <div className="text-gray-500 text-sm py-6 text-center">Carregando…</div>
        ) : todays.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-white/10">
            <Clock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-300 text-sm font-medium">Nenhum agendamento hoje</p>
            <p className="text-gray-500 text-xs mt-0.5">Aproveite para planejar a semana ✨</p>
            <button
              onClick={() => navigate('/appointments')}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#D65E9A] hover:bg-[#c44d87] text-white transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Criar agendamento
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-white/5 max-h-80 overflow-y-auto pr-1">
            {todays.slice(0, 6).map((a) => {
              const s = statusStyles[a.status] || statusStyles.agendado;
              return (
                <li key={a.id} className="py-2.5 flex items-center gap-3">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-white font-semibold tabular-nums font-[Sora,system-ui,sans-serif] text-sm">
                      {formatHour(a.appointment_time)}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{a.client_name}</p>
                    <p className="text-gray-500 text-xs truncate">{a.service_name}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${s.cls}`}>
                    <s.Icon className="w-3 h-3" />
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

const Stat = ({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  small?: boolean;
}) => (
  <div className="bg-[#0f0a17]/60 border border-white/5 rounded-2xl p-3">
    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
    <p
      className={`mt-1 font-bold font-[Sora,system-ui,sans-serif] tabular-nums ${
        small ? 'text-base' : 'text-xl'
      } ${accent ? 'text-emerald-400' : 'text-white'}`}
    >
      {value}
    </p>
  </div>
);
