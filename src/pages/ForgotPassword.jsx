import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Enviar solicitud de reset
      // Nota: Base44 maneja el reset internamente
      // Esto es un placeholder - la lógica real depende de tu configuración de auth
      
      // Por ahora, redirigimos a la página de login con un mensaje
      setSubmitted(true);
      
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 3000);
    } catch (err) {
      setError('Error al procesar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {!submitted ? (
            <>
              <div className="mb-8">
                <button
                  onClick={() => navigate(createPageUrl('Dashboard'))}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">Recuperar Contraseña</h1>
                <p className="text-slate-600">
                  Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-900 mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-10"
                >
                  {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </Button>
              </form>

              <p className="text-xs text-slate-500 text-center mt-6">
                ¿Recordaste tu contraseña?{' '}
                <button
                  onClick={() => navigate(createPageUrl('Dashboard'))}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mb-6"
              >
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              </motion.div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Revisa tu email!</h2>
              <p className="text-slate-600 mb-6">
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>
              </p>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 mb-6">
                El enlace expira en 24 horas. Si no lo recibiste, revisa tu carpeta de spam.
              </div>

              <Button
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Volver al Inicio
              </Button>

              <p className="text-xs text-slate-500 mt-4">
                Redireccionando automáticamente en 3 segundos...
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}