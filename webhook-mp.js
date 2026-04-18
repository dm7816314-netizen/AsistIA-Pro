import crypto from 'crypto';

function generatePassword() {
  return crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
}

function generateUserId() {
  return crypto.randomBytes(6).toString('hex');
}

// Base de datos en memoria (en producción usa una DB real: PlanetScale, Supabase, etc.)
// Esta variable persiste mientras el servidor esté vivo en Vercel
if (!global.clients) global.clients = {};

export { global as clientsDB };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const body = req.body;

  // Verificar que el pago fue aprobado
  const isPaid = body?.action === 'payment.created' || body?.type === 'payment';
  if (!isPaid) return res.status(200).json({ ok: true });

  // Obtener detalles del pago desde MP
  let paymentData = null;
  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${body.data?.id}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    paymentData = await mpRes.json();
  } catch (e) {
    return res.status(200).json({ ok: true });
  }

  if (paymentData?.status !== 'approved') return res.status(200).json({ ok: true });

  const email = paymentData.payer?.email;
  const planName = detectPlan(paymentData.transaction_amount);
  if (!email) return res.status(200).json({ ok: true });

  // Crear cuenta del cliente
  const userId = generateUserId();
  const password = generatePassword();
  const clientData = {
    userId,
    email,
    password,
    plan: planName,
    price: paymentData.transaction_amount,
    status: 'active',
    createdAt: new Date().toISOString(),
    config: {
      businessName: '',
      assistantPrompt: '',
      schedule: '',
      services: '',
    }
  };

  global.clients[userId] = clientData;

  // Enviar email de bienvenida con credenciales
  await sendWelcomeEmail(email, password, userId, planName);

  return res.status(200).json({ ok: true });
}

function detectPlan(amount) {
  if (amount <= 4990) return 'Básico';
  if (amount <= 9990) return 'Pro';
  return 'Premium';
}

async function sendWelcomeEmail(email, password, userId, plan) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const loginUrl = `${process.env.APP_URL || 'https://tuapp.vercel.app'}/cliente.html?id=${userId}`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'AsistIA Pro <bienvenida@tudominio.cl>',
      to: email,
      subject: '¡Tu asistente IA está listo! Aquí tus accesos',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:2rem;color:#1a1a18">
          <h2 style="color:#185FA5">¡Bienvenido a AsistIA Pro!</h2>
          <p>Tu plan <strong>${plan}</strong> está activo. Ya puedes configurar tu asistente.</p>
          <div style="background:#f7f7f5;border-radius:10px;padding:1.25rem;margin:1.5rem 0">
            <p style="margin:0 0 8px;font-size:13px;color:#6b6b66">TUS ACCESOS</p>
            <p style="margin:4px 0"><strong>Email:</strong> ${email}</p>
            <p style="margin:4px 0"><strong>Contraseña:</strong> <code style="background:#e4e2dc;padding:2px 6px;border-radius:4px">${password}</code></p>
          </div>
          <a href="${loginUrl}" style="display:inline-block;background:#185FA5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500">Entrar a mi panel →</a>
          <p style="font-size:12px;color:#6b6b66;margin-top:1.5rem">Desde tu panel puedes configurar el nombre, horarios y personalidad de tu asistente.</p>
        </div>
      `
    })
  });
}
