import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, BookOpen, FileText, HelpCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AIContentGenerator({ onApplyCourse, onApplyQuiz }) {
  const [activeTab, setActiveTab] = useState('course');
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('operacion');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [generatedContent, setGeneratedContent] = useState(null);

  const generateCourse = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor ingresa un tema o descripción');
      return;
    }

    setGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Eres un experto diseñador instruccional. Crea un curso de capacitación completo y detallado sobre: "${prompt}"

Categoría: ${category}
Nivel de dificultad: ${difficulty}

Genera un curso estructurado que incluya:
1. Título atractivo y profesional
2. Descripción detallada (2-3 párrafos)
3. Objetivos de aprendizaje específicos y medibles (4-6 objetivos)
4. Contenido del curso dividido en módulos/lecciones
5. Duración estimada en minutos
6. Recursos externos recomendados (artículos, videos, documentos)
7. Competencias que desarrollará el participante

El curso debe ser práctico, aplicable y orientado a la industria minera/industrial.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            objectives: {
              type: "array",
              items: { type: "string" }
            },
            modules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  duration_minutes: { type: "number" }
                }
              }
            },
            total_duration_minutes: { type: "number" },
            external_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url: { type: "string" },
                  type: { type: "string" }
                }
              }
            },
            competencies: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGeneratedContent(response);
      toast.success('Curso generado exitosamente');
    } catch (error) {
      toast.error('Error al generar el curso');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const generateLessonPlan = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor ingresa un tema para la lección');
      return;
    }

    setGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Crea un plan de lección detallado sobre: "${prompt}"

Categoría: ${category}
Nivel: ${difficulty}

Incluye:
1. Título de la lección
2. Objetivos de aprendizaje específicos (3-5)
3. Materiales necesarios
4. Actividades de inicio (warm-up)
5. Desarrollo del contenido (explicaciones, ejemplos, demostraciones)
6. Ejercicios prácticos y actividades
7. Evaluación formativa
8. Cierre y conclusiones
9. Tiempo estimado para cada sección
10. Recursos adicionales

Haz que sea práctico, interactivo y orientado a adultos en contexto industrial.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            objectives: {
              type: "array",
              items: { type: "string" }
            },
            materials: {
              type: "array",
              items: { type: "string" }
            },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  content: { type: "string" },
                  duration_minutes: { type: "number" },
                  activities: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  expected_outcome: { type: "string" }
                }
              }
            },
            assessment: { type: "string" },
            resources: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGeneratedContent(response);
      toast.success('Plan de lección generado exitosamente');
    } catch (error) {
      toast.error('Error al generar el plan de lección');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const generateQuiz = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor ingresa un tema para el quiz');
      return;
    }

    setGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Crea un quiz de evaluación sobre: "${prompt}"

Categoría: ${category}
Nivel: ${difficulty}

Genera 10 preguntas de opción múltiple con las siguientes características:
- 4 opciones por pregunta
- Solo una respuesta correcta
- Preguntas variadas: conceptuales, aplicación práctica, casos de estudio
- Explicación breve de por qué es correcta la respuesta
- Preguntas relevantes para la industria minera/industrial
- Progresión de dificultad (fácil → difícil)

Las preguntas deben evaluar comprensión profunda, no solo memorización.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  correct_answer: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedContent(response);
      toast.success('Quiz generado exitosamente');
    } catch (error) {
      toast.error('Error al generar el quiz');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (activeTab === 'course') {
      generateCourse();
    } else if (activeTab === 'lesson') {
      generateLessonPlan();
    } else if (activeTab === 'quiz') {
      generateQuiz();
    }
  };

  const handleApply = () => {
    if (!generatedContent) return;

    if (activeTab === 'course' && onApplyCourse) {
      const courseData = {
        title: generatedContent.title,
        description: generatedContent.description,
        category: category,
        duration_minutes: generatedContent.total_duration_minutes,
        external_resources: generatedContent.external_resources || []
      };
      onApplyCourse(courseData);
      toast.success('Curso aplicado al formulario');
    } else if (activeTab === 'quiz' && onApplyQuiz) {
      onApplyQuiz(generatedContent);
      toast.success('Quiz generado y listo para usar');
    }
  };

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-violet-50/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Generador de Contenido con IA</CardTitle>
            <CardDescription>Crea cursos, lecciones y evaluaciones automáticamente</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="course" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Curso Completo
            </TabsTrigger>
            <TabsTrigger value="lesson" className="gap-2">
              <FileText className="w-4 h-4" />
              Plan de Lección
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <HelpCircle className="w-4 h-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="course" className="space-y-4">
            <div>
              <Label>¿Sobre qué tema quieres crear el curso?</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Operación segura de maquinaria pesada en minería, incluyendo procedimientos de inspección pre-operacional y manejo de emergencias"
                rows={3}
                className="mt-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="lesson" className="space-y-4">
            <div>
              <Label>¿Qué tema debe cubrir esta lección?</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Técnicas de lubricación y mantenimiento preventivo de sistemas hidráulicos"
                rows={3}
                className="mt-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            <div>
              <Label>¿Sobre qué tema será el quiz?</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Normativas de seguridad en espacios confinados y procedimientos de rescate"
                rows={3}
                className="mt-2"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operacion">Operación</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="seguridad">Seguridad</SelectItem>
                <SelectItem value="calidad">Calidad</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nivel de Dificultad</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generar con IA
            </>
          )}
        </Button>

        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 p-4 bg-white rounded-xl border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-slate-900">Contenido Generado</h3>
              </div>
              <Badge className="bg-emerald-500">✓ Listo</Badge>
            </div>

            {activeTab === 'course' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-500">Título</Label>
                  <p className="font-semibold text-slate-900">{generatedContent.title}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Descripción</Label>
                  <p className="text-sm text-slate-600">{generatedContent.description}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Objetivos ({generatedContent.objectives?.length})</Label>
                  <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                    {generatedContent.objectives?.slice(0, 3).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Label className="text-xs text-slate-500">Módulos</Label>
                    <p className="font-semibold text-indigo-600">{generatedContent.modules?.length}</p>
                  </div>
                  <div className="p-2 bg-violet-50 rounded-lg">
                    <Label className="text-xs text-slate-500">Duración</Label>
                    <p className="font-semibold text-violet-600">{generatedContent.total_duration_minutes} min</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lesson' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-500">Título</Label>
                  <p className="font-semibold text-slate-900">{generatedContent.title}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Secciones</Label>
                  <p className="text-sm text-slate-600">{generatedContent.sections?.length} secciones</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Ejercicios Prácticos</Label>
                  <p className="text-sm text-slate-600">{generatedContent.exercises?.length} ejercicios</p>
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-500">Título</Label>
                  <p className="font-semibold text-slate-900">{generatedContent.title}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Preguntas</Label>
                  <p className="text-sm text-slate-600">{generatedContent.questions?.length} preguntas</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Vista previa</Label>
                  <p className="text-sm text-slate-600">{generatedContent.questions?.[0]?.question}</p>
                </div>
              </div>
            )}

            {(activeTab === 'course' || activeTab === 'quiz') && (
              <Button onClick={handleApply} variant="outline" className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Aplicar al Formulario
              </Button>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}