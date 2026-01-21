import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MessageSquare, Trash2, User, ThumbsUp, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ForumModeration({ discussions, courses }) {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: (postId) => base44.entities.DiscussionPost.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-discussions'] });
      toast.success('Publicación eliminada');
    },
  });

  const getCourseName = (courseId) => {
    return courses.find(c => c.id === courseId)?.title || 'Curso desconocido';
  };

  const filteredDiscussions = discussions.filter(d => {
    const matchesSearch = 
      d.content.toLowerCase().includes(search.toLowerCase()) ||
      d.user_name.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || d.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const mainPosts = filteredDiscussions.filter(p => !p.parent_id);
  const getRepliesCount = (postId) => {
    return discussions.filter(d => d.parent_id === postId).length;
  };

  const handleDelete = (postId) => {
    if (confirm('¿Estás seguro de eliminar esta publicación?')) {
      deletePostMutation.mutate(postId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderación de Foro</CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar en discusiones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los cursos</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mainPosts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No hay publicaciones para mostrar</p>
            </div>
          ) : (
            mainPosts.map((post) => {
              const repliesCount = getRepliesCount(post.id);
              
              return (
                <div key={post.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{post.user_name}</span>
                            {post.is_instructor && (
                              <Badge className="bg-violet-100 text-violet-700 text-xs">
                                Instructor
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(post.created_date), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{getCourseName(post.course_id)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {post.likes || 0} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <Reply className="w-3 h-3" />
                          {repliesCount} respuestas
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}