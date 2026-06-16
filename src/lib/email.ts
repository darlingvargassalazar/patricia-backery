import nodemailer from 'nodemailer'

export type EmailConfig = {
  apiKey: string   // contraseña de aplicación de Gmail
  from: string     // dirección Gmail
  fromName?: string | null
}

type OrderEmailData = {
  to: string
  customerName: string
  deliveryDate: string
  items: Array<{ name: string; quantity: number; unit_price: number }>
  total: number
  deposit: number
  isGift: boolean
}

function formatCOP(n: number) {
  return `$${Math.round(n).toLocaleString('es-CO')}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function buildHtml(data: OrderEmailData): string {
  const pending = data.total - data.deposit
  const itemRows = data.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 10px;color:#444;font-size:14px;">${i.name}</td>
        <td style="padding:8px 10px;color:#666;font-size:14px;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 10px;color:#444;font-size:14px;text-align:right;font-weight:600;">${formatCOP(i.quantity * i.unit_price)}</td>
      </tr>`
    )
    .join('')

  const paymentBlock =
    !data.isGift && pending > 0
      ? `
    <div style="margin-top:20px;padding:16px;background:#fdf6ef;border-radius:8px;border-left:4px solid #6b4d2e;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#6b4d2e;">💳 Datos para completar el pago</p>
      <p style="margin:0 0 6px;font-size:14px;color:#555;">Puedes consignar a la llave <strong>@3506954748</strong></p>
      <p style="margin:0;font-size:14px;color:#555;">Una vez realizado el pago, envía el comprobante al WhatsApp <strong>3506954748</strong></p>
    </div>`
      : ''

  const giftBadge = data.isGift
    ? `<div style="margin:16px 0;padding:12px;background:#fff0f6;border-radius:8px;text-align:center;font-size:14px;color:#c2185b;">🎁 Este pedido es un obsequio</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px 10px;background:#fdf6ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #f0e0cc;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

    <div style="background:#6b4d2e;padding:28px 24px;text-align:center;">
      <div style="font-size:32px;margin-bottom:6px;">🧁</div>
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;letter-spacing:0.5px;">PattyBakery</h1>
      <p style="margin:6px 0 0;color:#f0d8be;font-size:13px;">¡Tu pedido ha sido confirmado!</p>
    </div>

    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:15px;color:#333;">Hola <strong>${data.customerName}</strong>, ¡gracias por tu pedido! 🎂</p>

      ${giftBadge}

      <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">
        <thead>
          <tr style="background:#fdf6ef;border-bottom:1px solid #f0e0cc;">
            <th style="padding:8px 10px;text-align:left;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Producto</th>
            <th style="padding:8px 10px;text-align:center;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Cant.</th>
            <th style="padding:8px 10px;text-align:right;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Precio</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="border-top:1px solid #f0e0cc;padding-top:12px;margin-top:4px;">
        ${
          !data.isGift
            ? `<div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;">
          <span style="color:#666;">Total del pedido:</span>
          <span style="color:#333;font-weight:600;">${formatCOP(data.total)}</span>
        </div>
        ${data.deposit > 0 ? `<div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;">
          <span style="color:#666;">Adelanto recibido:</span>
          <span style="color:#2e7d52;font-weight:600;">${formatCOP(data.deposit)}</span>
        </div>` : ''}
        <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;padding-top:6px;border-top:1px dashed #f0e0cc;margin-top:6px;">
          <span style="color:#333;">${pending > 0 ? 'Por cobrar:' : '✅ Pagado'}</span>
          <span style="color:${pending > 0 ? '#6b4d2e' : '#2e7d52'};">${pending > 0 ? formatCOP(pending) : formatCOP(data.total)}</span>
        </div>`
            : `<p style="text-align:center;font-size:20px;font-weight:700;color:#c2185b;margin:0;">Gratis 🎁</p>`
        }
      </div>

      ${paymentBlock}

      <div style="margin-top:20px;padding:12px 16px;background:#f0f7f3;border-radius:8px;text-align:center;">
        <p style="margin:0;font-size:13px;color:#555;">📅 Fecha de entrega: <strong style="color:#333;">${formatDate(data.deliveryDate)}</strong></p>
      </div>
    </div>

    <div style="padding:14px 24px;background:#fdf6ef;border-top:1px solid #f0e0cc;text-align:center;">
      <p style="margin:0;font-size:12px;color:#bbb;">Hecho con amor 💕 · PattyBakery · WhatsApp: 3506954748</p>
    </div>
  </div>
</body>
</html>`
}

export async function sendOrderConfirmationEmail(data: OrderEmailData, config: EmailConfig) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.from, pass: config.apiKey },
  })
  const from = config.fromName ? `"${config.fromName}" <${config.from}>` : config.from
  await transporter.sendMail({
    from,
    to: data.to,
    subject: 'Confirmación de pedido - PattyBakery',
    html: buildHtml(data),
  })
}
