import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // Solo aceptar POST
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    // Obtener datos del webhook
    const body = await req.json();

    // Mercado Pago envía notificaciones de diferentes tipos
    if (body.type === 'payment') {
      const paymentId = body.data.id;

      const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      if (!accessToken) {
        return Response.json({ error: 'Not configured' }, { status: 500 });
      }

      // Obtener detalles del pago desde Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const payment = await paymentResponse.json();

      // Si el pago fue aprobado
      if (payment.status === 'approved') {
        const metadata = payment.metadata || {};
        const userEmail = metadata.user_email || payment.payer?.email;
        const plan = metadata.plan;
        const billingCycle = metadata.billing_cycle;
        const months = metadata.months || 1;

        if (userEmail && plan) {
          // Crear o actualizar suscripción
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + months);

          const subscriptionData = {
            user_email: userEmail,
            plan: plan,
            status: 'active',
            stripe_customer_id: payment.payer?.id?.toString() || null,
            stripe_subscription_id: payment.id?.toString() || null,
            price_monthly: plan === 'pro' ? 149 : 399,
            starts_at: startDate.toISOString().split('T')[0],
            ends_at: endDate.toISOString().split('T')[0],
            billing_cycle: billingCycle,
            max_users: plan === 'pro' ? 50 : null,
            max_maintenance_records: plan === 'pro' ? null : null,
            max_courses: plan === 'pro' ? 5 : 50
          };

          // Guardar suscripción
          await base44.asServiceRole.entities.Subscription.create(subscriptionData);

          // Enviar email de confirmación
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: userEmail,
            subject: `Bienvenido al Plan ${plan.toUpperCase()} - ModulaX`,
            body: `Tu suscripción ha sido activada. Acceso válido hasta: ${endDate.toLocaleDateString('es-CL')}`
          });
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});