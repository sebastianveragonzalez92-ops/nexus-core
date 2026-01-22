import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, CheckCircle, Sparkles, Video, FileText, File } from 'lucide-react';
import ModuleLessonManager from './ModuleLessonManager';

export default function CourseContentManager({ courses }) {
  const [selectedCourse, setSelectedCourse] = useState(null);



  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white shadow-sm">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">
                Tipos de Contenido Disponibles
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Texto y artículos enriquecidos</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Video className="w-4 h-4 text-slate-500" />
                  <span>Videos (YouTube, Vimeo, etc.)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <File className="w-4 h-4 text-slate-500" />
                  <span>Documentos PDF</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-700 font-medium">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Escenarios Interactivos</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Contenido del Curso</CardTitle>
          <CardDescription>
            Selecciona un curso para gestionar sus módulos, lecciones y contenido
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No hay cursos disponibles</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedCourse?.id === course.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{course.title}</h3>
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration_minutes || 0} min
                    </span>
                    {course.requires_certification && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        Certificado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module & Lesson Management */}
      {selectedCourse && (
        <ModuleLessonManager course={selectedCourse} />
      )}
    </div>
  );
}