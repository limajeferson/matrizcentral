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
