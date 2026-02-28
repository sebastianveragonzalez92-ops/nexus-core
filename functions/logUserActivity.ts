import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      action,
      target_email,
      target_name,
      module,
      description,
      details,
      status = 'success',
      error_message,
    } = body;

    if (!action) {
      return Response.json({ error: 'Action is required' }, { status: 400 });
    }

    // Get client IP (try multiple headers)
    const ip_address =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';

    const user_agent = req.headers.get('user-agent') || 'unknown';

    const activityLog = await base44.asServiceRole.entities.ActivityLog.create({
      user_email: user.email,
      user_name: user.full_name || user.email,
      action,
      target_email: target_email || null,
      target_name: target_name || null,
      module: module || null,
      description: description || null,
      details: details || null,
      ip_address,
      user_agent,
      status,
      error_message: error_message || null,
    });

    return Response.json({
      status: 'success',
      log_id: activityLog.id,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});