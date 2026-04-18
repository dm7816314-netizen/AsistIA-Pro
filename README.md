# AsistIA Pro v3 · Flujo automático post-pago

Cuando un cliente paga → MercadoPago avisa → se crea su cuenta → recibe email → entra a configurar su asistente.

---

## Variables de entorno en Vercel (Settings → Environment Variables)

| Variable | Dónde conseguirla |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `MP_ACCESS_TOKEN` | mercadopago.cl → Tu negocio → Credenciales → Access Token producción |
| `RESEND_API_KEY` | resend.com (gratis hasta 3.000 emails/mes) |
| `APP_URL` | Tu URL de Vercel, ej: `https://asistia-pro.vercel.app` |
| `ADMIN_EMAIL` | Tu correo para notificaciones |

---

## Configurar webhook en MercadoPago

1. Ve a **mercadopago.cl → Tu negocio → Webhooks**
2. Crea un webhook con esta URL: `https://TUAPP.vercel.app/api/webhook-mp`
3. Activa el evento **"Pagos"**
4. Guarda

Cada vez que un cliente pague, MP llamará a esa URL y se creará la cuenta automáticamente.

---

## Flujo completo

```
Cliente paga en tu landing
       ↓
MercadoPago llama a /api/webhook-mp
       ↓
Se crea usuario + contraseña aleatoria
       ↓
Resend envía email con link a cliente.html?id=XXXX
       ↓
Cliente entra, configura nombre/horarios/servicios
       ↓
Su asistente IA queda activo y personalizado
```

---

## Archivos del proyecto

```
asistia3/
├── index.html          ← Landing con planes y precios
├── cliente.html        ← Panel del cliente (configura su asistente)
├── admin.html          ← Tu panel de administración
├── api/
│   ├── webhook-mp.js   ← Recibe pagos de MercadoPago
│   ├── login.js        ← Login de clientes
│   ├── client-config.js← Guarda/lee configuración del asistente
│   ├── chat.js         ← Motor de IA con config personalizada
│   └── subscribe.js    ← Registro manual de suscriptores
├── vercel.json
└── .env.example
```
