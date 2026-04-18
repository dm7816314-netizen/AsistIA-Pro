export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan credenciales' });

  const clients = global.clients || {};
  const client = Object.values(clients).find(c => c.email === email && c.password === password);

  if (!client) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  if (client.status !== 'active') return res.status(403).json({ error: 'Suscripción inactiva' });

  return res.status(200).json({
    userId: client.userId,
    email: client.email,
    plan: client.plan,
    config: client.config
  });
}
