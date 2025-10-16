export function emailVerifyHtml(params: {
  appName: string
  appUrl: string
  userName: string
  actionUrl: string
  logoUrl?: string
  brandColor?: string
}) {
  const {
    appName,
    appUrl,
    userName,
    actionUrl,
    logoUrl = 'https://picsum.photos/256/256?grayscale&blur=1',
    brandColor = '#2563eb'
  } = params

  const safeName = escapeHtml(userName || 'Пользователь')
  const safeApp = escapeHtml(appName || 'Наш сервис')
  const year = new Date().getFullYear()

  // Инлайн-стили максимально совместимы с почтовиками
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeApp} — Подтвердите email</title>
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    /* Умеренные ресеты */
    html,body{margin:0;padding:0;background:#f6f7fb}
    img{border:0;outline:none;text-decoration:none;display:block}
    a{text-decoration:none}
    /* Мобильная адаптация */
    @media (max-width:600px){
      .container{width:100% !important}
      .card{border-radius:14px !important}
      .content{padding:24px !important}
      .cta{width:100% !important;display:block !important}
    }
    /* Тёмная тема (частично поддерживается) */
    @media (prefers-color-scheme: dark){
      body{background:#0b1220}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f6f7fb;">
  <!-- прехедер (скрытый текст) -->
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
    Подтверждение адреса электронной почты для ${safeApp}.
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f7fb;">
    <tr>
      <td align="center" style="padding:24px;">
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:24px 24px 0 24px;background:#ffffff;">
              <a href="${appUrl}" target="_blank" rel="noopener" style="display:inline-block;">
                <img src="${logoUrl}" width="64" height="64" alt="${safeApp} logo" style="width:64px;height:64px;border-radius:12px;">
              </a>
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-weight:700;font-size:20px;color:#0f172a;margin-top:10px;">
                ${safeApp}
              </div>
              <a href="${appUrl}" target="_blank" rel="noopener" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:${brandColor};margin-top:6px;display:inline-block;">
                Перейти на сайт
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td class="content" style="padding:32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card" style="background:#ffffff;border-radius:14px;">
                <tr>
                  <td>
                    <h1 style="margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:24px;line-height:1.25;color:#0f172a;">
                      Здравствуйте, ${safeName}!
                    </h1>
                    <p style="margin:0 0 12px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#334155;">
                      Вы зарегистрировали новый аккаунт <strong>${safeApp}</strong> с этим адресом электронной почты.
                    </p>
                    <p style="margin:0 0 18px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#334155;">
                      Пожалуйста, подтвердите, что это действительно вы.
                    </p>

                    <!-- CTA -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding-top: 18px; padding-bottom: 10px;">
                          <a href="${actionUrl}"
                            target="_blank"
                            rel="noopener"
                            style="
                              display: inline-block;
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                              font-size: 15px;
                              font-weight: 700;
                              color: #ffffff;
                              text-decoration: none;
                              background: linear-gradient(90deg, #2563eb, #1d4ed8);
                              padding: 14px 28px;
                              border-radius: 10px;
                              box-shadow: 0 3px 6px rgba(37, 99, 235, 0.35);
                              transition: all 0.25s ease-in-out;
                            "
                            onmouseover="this.style.background='linear-gradient(90deg,#1d4ed8,#2563eb)';this.style.transform='translateY(-2px)';"
                            onmouseout="this.style.background='linear-gradient(90deg,#2563eb,#1d4ed8)';this.style.transform='translateY(0)';"
                          >
                            🔒 Подтвердить мой адрес электронной почты
                          </a>
                        </td>
                      </tr>
                    </table>


                    <!-- Divider -->
                    <div style="height:1px;background:#e5e7eb;margin:24px 0;"></div>

                    <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;line-height:1.6;color:#64748b;">
                      Если вы не регистрировались в ${safeApp}, просто проигнорируйте это письмо.
                    </p>
                    <p style="margin:0 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;line-height:1.6;color:#64748b;">
                      Ссылка действительна в течение 24 часов. Если кнопка выше не работает, скопируйте ссылку:
                      <br>
                      <a href="${actionUrl}" style="color:${brandColor};word-break:break-all;">${actionUrl}</a>
                    </p>

                    <div style="height:1px;background:#e5e7eb;margin:24px 0;"></div>

                    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;line-height:1.6;color:#64748b;">
                      Спасибо,<br>Команда ${safeApp}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:0 24px 24px 24px;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:12px;color:#94a3b8;">
                © ${year} ${safeApp}. Все права защищены.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function emailVerifyText(params: { appName: string; userName: string; actionUrl: string }) {
  const { appName, userName, actionUrl } = params
  return [
    `Здравствуйте, ${userName || 'Пользователь'}!`,
    ``,
    `Вы зарегистрировали новый аккаунт ${appName} с этим адресом электронной почты.`,
    `Пожалуйста, подтвердите, что это действительно вы:`,
    actionUrl,
    ``,
    `Если вы не регистрировались в ${appName}, просто проигнорируйте это письмо.`,
    `Ссылка действительна 24 часа.`,
    ``,
    `Спасибо,`,
    `Команда ${appName}`
  ].join('\n')
}

function escapeHtml(s: string) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
