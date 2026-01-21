import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Reply, Send, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DiscussionForum({ courseId, user }) {
  const [newPostContent, setNewPostContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['discussion-posts', courseId],
    queryFn: () => base44.entities.DiscussionPost.filter({ course_id: courseId }, '-created_date'),
  });

  const createPostMutation = useMutation({
    mutationFn: (postData) => base44.entities.DiscussionPost.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-posts'] });
      setNewPostContent('');
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Publicado exitosamente');
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DiscussionPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-posts'] });
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    createPostMutation.mutate({
      course_id: courseId,
      user_email: user.email,
      user_name: user.full_name || user.email,
      content: newPostContent,
      is_instructor: user.role === 'admin',
    });
  };

  const handleReply = (parentId) => {
    if (!replyContent.trim()) return;
    
    createPostMutation.mutate({
      course_id: courseId,
      user_email: user.email,
      user_name: user.full_name || user.email,
      content: replyContent,
      parent_id: parentId,
      is_instructor: user.role === 'admin',
    });
  };

  const handleLike = (post) => {
    updatePostMutation.mutate({
      id: post.id,
      data: { ...post, likes: (post.likes || 0) + 1 },
    });
  };

  const mainPosts = posts.filter(p => !p.parent_id);
  const getReplies = (postId) => posts.filter(p => p.parent_id === postId);

  return (
    <div className="space-y-6">
      {/* New Post */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Nueva Publicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Comparte tus ideas, preguntas o comentarios..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || createPostMutation.isPending}
              className="bg-gradient-to-r from-indigo-500 to-violet-500"
            >
              <Send className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {mainPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Aún no hay publicaciones. ¡Sé el primero en participar!</p>
            </CardContent>
          </Card>
        ) : (
          mainPosts.map((post) => {
            const replies = getReplies(post.id);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    {/* Post Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">
                            {post.user_name}
                          </span>
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
                        <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center gap-4 pl-13">
                      <button
                        onClick={() => handleLike(post)}
                        className="flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes || 0}
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                        className="flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                      >
                        <Reply className="w-4 h-4" />
                        Responder ({replies.length})
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === post.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pl-13"
                      >
                        <div className="flex gap-3">
                          <Textarea
                            placeholder="Escribe tu respuesta..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleReply(post.id)}
                            disabled={!replyContent.trim()}
                            size="sm"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="mt-4 pl-13 space-y-3 border-l-2 border-slate-200">
                        {replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3 pl-4">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-slate-900">
                                  {reply.user_name}
                                </span>
                                {reply.is_instructor && (
                                  <Badge className="bg-violet-100 text-violet-700 text-xs">
                                    Instructor
                                  </Badge>
                                )}
                                <span className="text-xs text-slate-500">
                                  {formatDistanceToNow(new Date(reply.created_date), { 
                                    addSuffix: true, 
                                    locale: es 
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                {reply.content}
                              </p>
                              <button
                                onClick={() => handleLike(reply)}
                                className="flex items-center gap-1 text-xs text-slate-600 hover:text-indigo-600 transition-colors mt-2"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                {reply.likes || 0}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}