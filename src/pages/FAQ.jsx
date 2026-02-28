import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const { data: faqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => base44.entities.FAQ.list('-order', 100),
  });

  const categories = ['general', 'billing', 'technical', 'training', 'maintenance'];
  const categoryLabels = {
    general: 'General',
    billing: 'Facturación',
    technical: 'Técnico',
    training: 'Capacitación',
    maintenance: 'Mantenimiento'
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory && faq.active;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Centro de Ayuda</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Encuentra respuestas a tus preguntas frecuentes sobre ModulaX
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Busca en el centro de ayuda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-4 py-2 rounded-full font-medium transition-all',
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full font-medium transition-all',
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </motion.div>

        {/* FAQs */}
        <div className="space-y-3">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                      <p className="text-xs text-slate-500 mt-1 capitalize">
                        {categoryLabels[faq.category]}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-slate-400 transition-transform shrink-0 mt-1',
                        expandedId === faq.id && 'rotate-180'
                      )}
                    />
                  </div>

                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-slate-100 text-slate-600 whitespace-pre-wrap"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </button>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No se encontraron preguntas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}