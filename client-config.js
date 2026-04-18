export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });

  const clients = global.clients || {};
  const client = clients[userId];
  if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

  if (req.method === 'GET') {
    return res.status(200).json({
      plan: client.plan,
      config: client.config,
      email: client.email
    });
  }

  if (req.method === 'POST') {
    const { businessName, assistantPrompt, schedule, services } = req.body;
    client.config = { businessName, assistantPrompt, schedule, services };
    global.clients[userId] = client;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
