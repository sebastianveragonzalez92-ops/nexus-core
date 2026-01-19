import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActivityItem from '@/components/ui/ActivityItem';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActivityFeed({ activities, isLoading, onViewAll }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-3xl border border-slate-200 overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50">
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Actividad reciente</h3>
            <p className="text-xs text-slate-500">Últimas acciones en la plataforma</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl">
          Ver todo
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="divide-y divide-slate-50">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-4 flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.slice(0, 5).map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))
        ) : (
          <div className="py-12 text-center">
            <Activity className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Sin actividad reciente</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}