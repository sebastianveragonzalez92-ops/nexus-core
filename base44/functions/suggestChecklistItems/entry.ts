import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, type, shift } = await req.json();

    const prompt = `
Eres un experto en seguridad y checklists industriales. Sugiere 8-10 items específicos y prácticos para un checklist de ${category} para ${type || 'equipos generales'} en el turno de ${shift}.

Considera:
- Elementos críticos de seguridad
- Verificaciones técnicas esenciales
- Estándares de la industria
- Prácticas recomendadas

Responde SOLO con un JSON válido sin explicaciones adicionales:
{
  "items": [
    { "name": "Nombre del item", "description": "Breve descripción", "type": "checkbox", "required": true },
    ...
  ],
  "tips": ["consejo 1", "consejo 2"]
}
    `;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string' },
                required: { type: 'boolean' },
              },
            },
          },
          tips: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    });

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});