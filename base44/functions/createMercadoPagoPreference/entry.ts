import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, billingCycle } = await req.json();

    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      return Response.json(
        { error: 'Mercado Pago no configurado' },
        { status: 500 }
      );
    }

    // Definir planes
    const planPrices = {
      pro_monthly: { title: 'Plan PRO - Mensual', price: 149, months: 1 },
      pro_annual: { title: 'Plan PRO - Anual', price: 1490, months: 12 },
      enterprise_monthly: { title: 'Plan Enterprise - Mensual', price: 399, months: 1 },
      enterprise_annual: { title: 'Plan Enterprise - Anual', price: 3990, months: 12 }
    };

    const planKey = `${plan}_${billingCycle}`;
    const planData = planPrices[planKey];

    if (!planData) {
      return Response.json({ error: 'Plan inválido' }, { status: 400 });
    }

    // Crear preferencia de pago en Mercado Pago
    const preference = {
      items: [
        {
          title: planData.title,
          quantity: 1,
          currency_id: 'CLP',
          unit_price: planData.price
        }
      ],
      payer: {
        email: user.email,
        name: user.full_name
      },
      back_urls: {
        success: `${Deno.env.get('APP_URL') || 'http://localhost:3000'}/pricing?status=success`,
        failure: `${Deno.env.get('APP_URL') || 'http://localhost:3000'}/pricing?status=failure`,
        pending: `${Deno.env.get('APP_URL') || 'http://localhost:3000'}/pricing?status=pending`
      },
      notification_url: `${Deno.env.get('APP_URL') || 'http://localhost:3000'}/api/mercadopago-webhook`,
      metadata: {
        user_email: user.email,
        plan: plan,
        billing_cycle: billingCycle,
        months: planData.months
      },
      auto_return: 'approved'
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(preference)
    });

    if (!mpResponse.ok) {
      const error = await mpResponse.json();
      return Response.json(
        { error: 'Error en Mercado Pago', details: error },
        { status: mpResponse.status }
      );
    }

    const preferenceData = await mpResponse.json();

    return Response.json({
      init_point: preferenceData.init_point,
      preference_id: preferenceData.id
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});