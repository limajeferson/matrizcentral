const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendTokenEmail(params: { to: string; token: string }): Promise<void> {
  const quizUrl = `${process.env.NEXT_PUBLIC_URL}/quiz/${params.token}`;

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Matriz Central", email: "contato@matrizcentral.com.br" },
      to: [{ email: params.to }],
      subject: "Seu token chegou! Descubra seu perfil 🚀",
      htmlContent: `
        <p>Seu ebook está confirmado.</p>
        <p>Descubra seu perfil de aprendizado e desbloqueie seu roadmap personalizado:</p>
        <p><a href="${quizUrl}">${quizUrl}</a></p>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Falha ao enviar e-mail via Brevo: ${response.status} ${responseBody}`);
  }
}

export async function sendLevelUpEmail(params: {
  to: string;
  level: number;
  levelName: string;
}): Promise<void> {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Matriz Central", email: "contato@matrizcentral.com.br" },
      to: [{ email: params.to }],
      subject: `Você subiu de nível! Agora você é ${params.levelName} 🎉`,
      htmlContent: `
        <p>Parabéns! Você atingiu o Nível ${params.level} — ${params.levelName}.</p>
        <p>Continue estudando para desbloquear o próximo nível.</p>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Falha ao enviar e-mail de level up via Brevo: ${response.status} ${responseBody}`);
  }
}

export async function sendCertificateEmail(params: {
  to: string;
  title: string;
  verificationCode: string;
}): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/certificado/${params.verificationCode}`;

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Matriz Central", email: "contato@matrizcentral.com.br" },
      to: [{ email: params.to }],
      subject: `Seu certificado está pronto: ${params.title} 🏆`,
      htmlContent: `
        <p>Parabéns por concluir sua trilha!</p>
        <p>Certificado: ${params.title}</p>
        <p>Verifique a autenticidade em: <a href="${verificationUrl}">${verificationUrl}</a></p>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Falha ao enviar e-mail de certificado via Brevo: ${response.status} ${responseBody}`);
  }
}

export async function sendMagicLinkEmail(params: {
  to: string;
  secret: string;
}): Promise<void> {
  const loginUrl = `${process.env.NEXT_PUBLIC_URL}/entrar/verificar?c=${params.secret}`;

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Matriz Central", email: "contato@matrizcentral.com.br" },
      to: [{ email: params.to }],
      subject: "Seu link de acesso à Matriz Central 🔑",
      htmlContent: `
        <p>Recebemos um pedido para entrar na sua conta.</p>
        <p>Clique no link abaixo para acessar (válido por 15 minutos, uso único):</p>
        <p><a href="${loginUrl}">${loginUrl}</a></p>
        <p>Se não foi você, pode ignorar este e-mail.</p>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Falha ao enviar magic link via Brevo: ${response.status} ${responseBody}`);
  }
}

async function sendBrevo(to: string, subject: string, htmlContent: string): Promise<void> {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY!, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "Matriz Central", email: "contato@matrizcentral.com.br" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao enviar e-mail via Brevo: ${response.status} ${body}`);
  }
}

export async function sendPassPurchaseEmail(params: { to: string; plan: "regular" | "advanced" }): Promise<void> {
  const nome = params.plan === "advanced" ? "Advanced" : "Regular";
  await sendBrevo(
    params.to,
    `Seu passe ${nome} está ativo 🎉`,
    `<p>Seu passe <strong>${nome}</strong> foi ativado — 12 meses de acesso.</p>
     <p>Entre pela sua conta em <a href="${process.env.NEXT_PUBLIC_URL}/entrar">${process.env.NEXT_PUBLIC_URL}/entrar</a> e comece a consumir.</p>`
  );
}

export async function sendNewCycleEmail(params: { to: string }): Promise<void> {
  await sendBrevo(
    params.to,
    "Novo ciclo: escolha seu conteúdo do mês 📅",
    `<p>Seu novo ciclo abriu — você pode desbloquear <strong>mais 1 conteúdo</strong> este mês.</p>
     <p>Escolha em <a href="${process.env.NEXT_PUBLIC_URL}/conta">sua conta</a>.</p>`
  );
}

export async function sendNewContentEmail(params: { to: string; contentTitle: string }): Promise<void> {
  await sendBrevo(
    params.to,
    "Novo conteúdo disponível na Matriz Central 🚀",
    `<p>Acabou de sair: <strong>${params.contentTitle}</strong>.</p>
     <p>Como Advanced, já está liberado pra você em <a href="${process.env.NEXT_PUBLIC_URL}/conta">sua conta</a>.</p>`
  );
}

export async function sendExpiryEmail(params: { to: string; daysLeft: number }): Promise<void> {
  await sendBrevo(
    params.to,
    `Seu passe expira em ${params.daysLeft} dia(s) ⏳`,
    `<p>Seu acesso termina em <strong>${params.daysLeft} dia(s)</strong>.</p>
     <p>Renove em <a href="${process.env.NEXT_PUBLIC_URL}/oferta">${process.env.NEXT_PUBLIC_URL}/oferta</a> para não perder o consumo.</p>`
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendSupportNotification(params: { fromEmail: string; message: string }): Promise<void> {
  // Escapa o input do usuário — evita injeção de HTML no inbox do time.
  const from = escapeHtml(params.fromEmail);
  const msg = escapeHtml(params.message).replace(/\n/g, "<br>");
  await sendBrevo(
    "contato@matrizcentral.com.br",
    `Nova mensagem de suporte de ${params.fromEmail}`,
    `<p><strong>De:</strong> ${from}</p><p><strong>Mensagem:</strong></p><p>${msg}</p>`
  );
}
