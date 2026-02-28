import React from 'react';
import { motion } from 'framer-motion';
import ConnectionStatus from '@/components/ui/ConnectionStatus';

export default function DashboardHeader({ user, pendingCount, onSync }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Bienvenido{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-slate-500 mt-1">
          Gestiona tu plataforma modular de forma eficiente
        </p>
      </div>

      <div className="flex items-center gap-3">
        <ConnectionStatus pendingCount={pendingCount} onSync={onSync} />
      </div>
    </motion.header>);

}