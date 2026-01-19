import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, MessageSquare } from 'lucide-react';
import TutorChat from '@/components/tutor/TutorChat';
import QuickActions from '@/components/tutor/QuickActions';
import { Card } from '@/components/ui/card';

export default function Tutor() {
  const [conversationId, setConversationId] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const handleQuickAction = (prompt) => {
    setShowChat(true);
    // El prompt se pasará al chat cuando se monte
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = prompt;
        textarea.focus();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-200 mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Tutor Inteligente
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Tu asistente virtual para consultas técnicas, procedimientos operativos y diagnóstico de fallas
          </p>
        </motion.div>

        {!showChat ? (
          <>
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-4">¿En qué puedo ayudarte?</h2>
              <QuickActions onActionClick={handleQuickAction} />
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <Card className="p-6 bg-white/80 backdrop-blur border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-indigo-50">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">FAQs Técnicas</h3>
                    <p className="text-sm text-slate-500">
                      Acceso instantáneo a preguntas frecuentes sobre operación y mantenimiento
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-emerald-50">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Procedimientos (SOPs)</h3>
                    <p className="text-sm text-slate-500">
                      Consulta guías paso a paso para operaciones seguras y efectivas
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-rose-50">
                    <Bot className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Diagnóstico IA</h3>
                    <p className="text-sm text-slate-500">
                      Asistencia inteligente para identificar y resolver problemas técnicos
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Start Chat CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <button
                onClick={() => setShowChat(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                Iniciar conversación
              </button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
            style={{ height: 'calc(100vh - 200px)' }}
          >
            <TutorChat
              conversationId={conversationId}
              onConversationCreated={setConversationId}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}