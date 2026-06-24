import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ZOHO_SMTP_USER,
      pass: process.env.ZOHO_SMTP_PASS,
    },
  });
}

const from = () => `"CSP Nexora" <${process.env.ZOHO_SMTP_USER}>`;
const to   = () => process.env.NOTIFICATION_EMAIL!;

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;width:130px;vertical-align:top;">${label}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:14px;font-weight:600;">${value}</td>
    </tr>`;
}

function emailWrapper(title: string, badge: string, rows: string, timestamp: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1);">
    <div style="background:#050505;padding:24px 32px;">
      <span style="display:inline-block;background:#0e7490;color:#fff;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:3px 10px;border-radius:20px;margin-bottom:10px;">${badge}</span>
      <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0;letter-spacing:-.02em;">${title}</h1>
    </div>
    <div style="padding:28px 32px;background:#fff;">
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      <p style="margin:20px 0 0;font-size:11px;color:#aaa;">Recebido em: ${timestamp}</p>
    </div>
    <div style="background:#f9f9f9;padding:12px 32px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;font-size:10px;color:#bbb;letter-spacing:.1em;text-transform:uppercase;">CSP Nexora — Notificação automática</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendLeadNotification(data: {
  nome: string;
  email: string;
  empresa: string;
  telefone: string;
}) {
  const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const html = emailWrapper(
    `Novo Lead — ${data.empresa}`,
    'Diagnóstico',
    row('Nome', data.nome) +
    row('Email', data.email) +
    row('Empresa', data.empresa) +
    row('Telefone', data.telefone),
    timestamp,
  );

  await createTransporter().sendMail({
    from: from(),
    to: to(),
    subject: `[Novo Lead] ${data.nome} — ${data.empresa}`,
    html,
  });
}

export async function sendLeadGMNNotification(data: {
  nome: string;
  email: string;
  empresa: string;
  telefone: string;
  plano?: string;
  origem: string;
  stage: string;
  notes?: string;
  codigo?: string;
}) {
  const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const codigoRow = data.codigo
    ? `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#888;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;width:130px;vertical-align:top;">Código Pag.</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
        <span style="background:#0e7490;color:#fff;font-size:13px;font-weight:700;letter-spacing:.05em;padding:4px 12px;border-radius:6px;display:inline-block;">${data.codigo}</span>
      </td>
    </tr>`
    : '';

  const rows =
    row('Nome', data.nome) +
    row('Email', data.email || '—') +
    row('Empresa', data.empresa) +
    row('Telefone', data.telefone) +
    (data.plano ? row('Plano', data.plano) : '') +
    row('Origem', data.origem) +
    row('Estágio', data.stage) +
    codigoRow +
    (data.notes ? row('Anotações', data.notes.replace(/\n/g, '<br>')) : '');

  const html = emailWrapper(
    `Lead GMN — ${data.empresa}`,
    'GMN',
    rows,
    timestamp,
  );

  await createTransporter().sendMail({
    from: from(),
    to: to(),
    subject: `[Lead GMN] [${data.stage}] — ${data.empresa}`,
    html,
  });
}

export async function sendContatoNotification(data: {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}) {
  const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const html = emailWrapper(
    `Contato — ${data.assunto}`,
    'Fale Conosco',
    row('Nome', data.nome) +
    row('Email', data.email) +
    row('Assunto', data.assunto) +
    row('Mensagem', data.mensagem.replace(/\n/g, '<br>')),
    timestamp,
  );

  await createTransporter().sendMail({
    from: from(),
    to: to(),
    subject: `[Contato] ${data.assunto} — ${data.nome}`,
    html,
  });
}
