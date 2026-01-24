import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Video, FileText, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const typeIcons = {
  video: Video,
  scorm: FileText,
  xapi: FileText,
  microlearning: FileText,
  evaluation: Award,
};

const categoryColors = {
  operacion: 'bg-blue-100 text-blue-700',
  mantenimiento: 'bg-amber-100 text-amber-700',
  seguridad: 'bg-rose-100 text-rose-700',
  calidad: 'bg-emerald-100 text-emerald-700',
  tecnico: 'bg-indigo-100 text-indigo-700',
};

export default function CourseCard({ course, index, onEdit, onDelete, user }) {
  const TypeIcon = typeIcons[course.type] || FileText;
  const navigate = useNavigate();

  const handleCardClick = () => {
    window.location.href = createPageUrl('CourseDetail') + `?id=${course.id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50">
              <TypeIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 line-clamp-1">{course.title}</h3>
              <Badge className={cn('mt-1', categoryColors[course.category])}>
                {course.category}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {course.description || 'Sin descripción'}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          {course.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration_minutes} min
            </div>
          )}
          {course.requires_certification && (
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Certificación
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={course.status === 'published' ? 'default' : 'secondary'}
            className={cn(
              course.status === 'published'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            )}
          >
            {course.status === 'published' ? 'Publicado' : 'Borrador'}
          </Badge>
          {user?.role === 'admin' && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                }}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(course.id);
                }}
                className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}