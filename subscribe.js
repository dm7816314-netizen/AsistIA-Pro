export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { biz, email, phone, plan, price } = req.body;
  if (!biz || !email || !plan) return res.status(400).json({ error: 'Faltan campos requeridos' });

  const now = new Date();
  const fecha = now.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const subscriber = { biz, email, phone: phone || '', plan, precio: price, estado: 'Pendiente', fecha, ts: now.toISOString() };

  // Notificación por email al dueño (requiere servicio de email configurado)
  // Si tienes un servicio como Resend, SendGrid o similar, descomenta y configura:
  /*
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'AsistIA Pro <noreply@tudominio.cl>',
      to: process.env.ADMIN_EMAIL,
      subject: `Nueva suscripción: ${plan} · ${biz}`,
      html: `<h2>Nueva suscripción registrada</h2>
             <p><strong>Negocio:</strong> ${biz}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Plan:</strong> ${plan} · $${price.toLocaleString('es-CL')}/mes</p>
             <p><strong>Fecha:</strong> ${fecha}</p>`
    })
  });
  */

  return res.status(200).json({ success: true, subscriber });
}
