export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, userId } = req.body;

  // Obtener configuración personalizada del cliente
  let systemPrompt = 'Eres un asistente administrativo virtual. Responde siempre en español, de forma amable y profesional.';
  if (userId && global.clients?.[userId]?.config) {
    const cfg = global.clients[userId].config;
    if (cfg.assistantPrompt) {
      systemPrompt = cfg.assistantPrompt;
    } else {
      const biz = cfg.businessName || 'este negocio';
      const sched = cfg.schedule ? `Horarios: ${cfg.schedule}.` : '';
      const svcs = cfg.services ? `Servicios: ${cfg.services}.` : '';
      systemPrompt = `Eres el asistente virtual de ${biz}. Responde en español, amable y profesional. ${sched} ${svcs} Si no sabes algo, ofrece transferir al equipo humano.`;
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages: (messages || []).slice(-10)
      })
    });
    const data = await response.json();
    return res.status(200).json({ reply: data.content?.[0]?.text || 'Error al responder.' });
  } catch (e) {
    return res.status(500).json({ reply: 'Error de conexión. Intenta de nuevo.' });
  }
}
