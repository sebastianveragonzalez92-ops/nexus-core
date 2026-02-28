import { base44 } from '@/api/base44Client';

/**
 * Registra un movimiento de stock en el historial.
 * @param {object} params
 */
export async function registerStockMovement({
  part,
  tipo,        // 'entrada' | 'salida' | 'ajuste'
  cantidad,    // siempre positivo
  stockAnterior,
  stockPosterior,
  user,        // { email, full_name }
  notas,
  workOrderId,
  workOrderNumber,
}) {
  await base44.entities.StockMovement.create({
    spare_part_id: part.id,
    spare_part_code: part.code,
    spare_part_name: part.name,
    tipo,
    cantidad,
    stock_anterior: stockAnterior,
    stock_posterior: stockPosterior,
    user_email: user?.email || 'desconocido',
    user_name: user?.full_name || user?.email || 'desconocido',
    work_order_id: workOrderId || null,
    work_order_number: workOrderNumber || null,
    notas: notas || null,
  });
}