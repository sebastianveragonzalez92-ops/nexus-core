import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CourseCalendar({ enrolledCourses }) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Generar eventos del calendario
  const calendarEvents = enrolledCourses.flatMap(enrollment => {
    const events = [];
    
    if (enrollment.started_date) {
      events.push({
        date: new Date(enrollment.started_date),
        type: 'start',
        course: enrollment.course,
        enrollment,
        label: 'Inicio',
        color: 'bg-blue-100 text-blue-700 border-blue-200'
      });
    }
    
    if (enrollment.completed_date) {
      events.push({
        date: new Date(enrollment.completed_date),
        type: 'end',
        course: enrollment.course,
        enrollment,
        label: 'Completado',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
      });
    }
    
    return events;
  });

  const getEventsForDay = (day) => {
    return calendarEvents.filter(event => isSameDay(event.date, day));
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendario de Capacitaciones
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {/* Espacios vacíos antes del primer día */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Días del mes */}
          {daysInMonth.map(day => {
            const events = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  aspect-square p-2 rounded-lg border transition-all
                  ${isToday ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}
                  ${!isSameMonth(day, currentDate) ? 'opacity-40' : ''}
                `}
              >
                <div className="text-xs font-medium text-slate-700 mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {events.slice(0, 2).map((event, idx) => (
                    <div
                      key={idx}
                      className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer border ${event.color}`}
                      onClick={() => navigate(createPageUrl('CourseDetail') + `?id=${event.enrollment.course_id}`)}
                      title={`${event.label}: ${event.course.title}`}
                    >
                      {event.label}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-[10px] text-slate-500 px-1">
                      +{events.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
            <span className="text-xs text-slate-600">Inicio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
            <span className="text-xs text-slate-600">Completado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}