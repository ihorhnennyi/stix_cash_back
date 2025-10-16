export function passwordResetHtml({
  appName,
  appUrl,
  userName,
  actionUrl,
  logoUrl = 'https://picsum.photos/256/256?grayscale&blur=1',
  brandColor = '#2563eb'
}: {
  appName: string
  appUrl: string
  userName: string
  actionUrl: string
  logoUrl?: string
  brandColor?: string
}) {
  const esc = (s: string) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  const year = new Date().getFullYear()
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(appName)} — Сброс пароля</title></head>
<body style="margin:0;padding:0;background:#f6f7fb">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb"><tr><td align="center" style="padding:24px">
<table width="600" style="width:600px;max-width:600px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:24px 24px 0">
  <a href="${appUrl}"><img src="${logoUrl}" width="64" height="64" style="border-radius:12px" alt="${esc(appName)}"></a>
  <div style="font:700 20px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial">${esc(appName)}</div>
</td></tr>
<tr><td style="padding:32px">
  <h1 style="margin:0 0 10px;font:600 22px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial">Здравствуйте, ${esc(userName || 'User')}!</h1>
  <p style="margin:0 0 12px;font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#334155">Мы получили запрос на сброс пароля для вашей учётной записи ${esc(appName)}.</p>
  <p style="margin:0 0 18px;font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#334155">Чтобы создать новый пароль, перейдите по ссылке ниже:</p>
  <div style="text-align:center;margin:18px 0 10px">
    <a href="${actionUrl}" style="display:inline-block;background:linear-gradient(90deg,#2563eb,#1d4ed8);color:#fff;font:700 15px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;padding:14px 28px;border-radius:10px;text-decoration:none">🔑 Сбросить пароль</a>
  </div>
  <p style="margin:18px 0 8px;font:13px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#64748b">Эта ссылка будет действительна в течение <strong>15 минут</strong>.</p>
  <p style="margin:0 0 8px;font:13px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#64748b">Если вы не запрашивали сброс пароля, проигнорируйте это письмо — ваш пароль останется без изменений.</p>
  <div style="height:1px;background:#e5e7eb;margin:20px 0"></div>
  <p style="margin:0;font:12px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#94a3b8">© ${year} ${esc(appName)}. Все права защищены.</p>
</td></tr></table></td></tr></table></body></html>`
}
export function passwordResetText({
  appName,
  userName,
  actionUrl
}: {
  appName: string
  userName: string
  actionUrl: string
}) {
  return [
    `Здравствуйте, ${userName || 'User'}!`,
    ``,
    `Мы получили запрос на сброс пароля для вашей учётной записи ${appName}.`,
    `Чтобы создать новый пароль, перейдите по ссылке ниже:`,
    actionUrl,
    ``,
    `Эта ссылка будет действительна в течение 15 минут.`,
    `Если вы не запрашивали сброс пароля, просто игнорируйте это письмо.`
  ].join('\n')
}
