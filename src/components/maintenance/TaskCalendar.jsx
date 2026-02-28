import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const priorityColors = {
  baja: 'bg-blue-100 text-blue-700',
  media: 'bg-yellow-100 text-yellow-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

export default function TaskCalendar({ tasks, onTaskClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start
  const startDay = getDay(monthStart); // 0=Sun
  const paddingDays = Array(startDay).fill(null);

  const getTasksForDay = (day) =>
    tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date + 'T00:00:00'), day));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>Hoy</Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[80px] border-r border-b border-slate-100 bg-slate-50/50" />
        ))}
        {days.map(day => {
          const dayTasks = getTasksForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] border-r border-b border-slate-100 p-1.5 ${!inMonth ? 'bg-slate-50/50' : ''}`}
            >
              <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 ${
                isToday(day) ? 'bg-indigo-600 text-white' : 'text-slate-700'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map(t => (
                  <button
                    key={t.id}
                    onClick={() => onTaskClick(t)}
                    className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${priorityColors[t.priority] || 'bg-slate-100 text-slate-700'} hover:opacity-80 transition-opacity`}
                  >
                    {t.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-slate-400 pl-1">+{dayTasks.length - 3} más</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}