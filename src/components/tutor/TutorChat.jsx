import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, ThumbsUp, ThumbsDown, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export default function TutorChat({ conversationId, onConversationCreated, initialPrompt }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [agentConversation, setAgentConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const initConversation = async () => {
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        try {
          const conv = await base44.agents.createConversation({
            agent_name: 'tutor_tecnico',
            metadata: {
              name: 'Consulta Tutor',
              description: 'Conversación con tutor técnico'
            }
          });
          setAgentConversation(conv);
          
          if (initialPrompt) {
            setTimeout(() => handleSend(), 100);
          }
        } catch (error) {
          console.error('Error creating conversation:', error);
        }
      }
    };
    initConversation();
  }, []);

  useEffect(() => {
    if (!agentConversation) return;
    
    const unsubscribe = base44.agents.subscribeToConversation(agentConversation.id, (data) => {
      const formattedMessages = data.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toISOString(),
        tool_calls: msg.tool_calls
      }));
      setMessages(formattedMessages);
    });

    return () => unsubscribe();
  }, [agentConversation]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !agentConversation) return;

    setInput('');
    setIsLoading(true);

    try {
      await base44.agents.addMessage(agentConversation, {
        role: 'user',
        content: input.trim()
      });
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu consulta. Por favor intenta nuevamente.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (messageIndex, isPositive) => {
    // Implementar rating de respuestas
    console.log('Rating:', messageIndex, isPositive);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                message.role === 'user' 
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                  : message.isError
                    ? "bg-rose-50 border border-rose-200"
                    : "bg-white border border-slate-200"
              )}>
                {message.role === 'user' ? (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                ) : (
                  <>
                    <ReactMarkdown
                      className={cn(
                        "text-sm prose prose-sm max-w-none",
                        message.isError ? "prose-rose" : "prose-slate"
                      )}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                        code: ({ children }) => (
                          <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    
                    {!message.isError && (
                      <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleRating(index, true)}
                          className="p-1 rounded hover:bg-slate-100 transition-colors"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-500" />
                        </button>
                        <button
                          onClick={() => handleRating(index, false)}
                          className="p-1 rounded hover:bg-slate-100 transition-colors"
                        >
                          <ThumbsDown className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analizando tu consulta...
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4 bg-white">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribe tu pregunta técnica, consulta un SOP o describe una falla..."
            className="resize-none rounded-xl border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 px-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Presiona Enter para enviar, Shift + Enter para nueva línea
        </p>
      </div>
    </div>
  );
}