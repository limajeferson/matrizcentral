import { CAPACITY_PATHS, type CapacityTier } from "@/lib/capacity";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Cabeçalho de marca dos e-mails.
 *
 * Decisão: **PNG por URL absoluta**, não o SVG inline do `Logo.tsx`. Gmail,
 * Outlook (Word rendering engine) e a maioria dos apps móveis não renderizam
 * SVG — o inline viraria um buraco no topo da mensagem. `mc-avatar-800.png` já
 * existe em `public/brand/` (cubo sobre fundo escuro), então não entra asset
 * novo e o custo continua zero.
 *
 * Se `NEXT_PUBLIC_URL` não estiver definida, o `<img>` some (um `src` relativo
 * quebraria em qualquer cliente) e o e-mail sai só com o wordmark em texto.
 */
export function emailShell(
  bodyHtml: string,
  siteUrl: string | undefined = process.env.NEXT_PUBLIC_URL
): string {
  const logo = siteUrl
    ? `<img src="${siteUrl}/brand/mc-avatar-800.png" width="40" height="40" alt="" style="display:block;border:0;border-radius:8px;" />`
    : "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
  <tr><td style="padding-bottom:16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      ${logo ? `<td style="padding-right:10px;">${logo}</td>` : ""}
      <td style="font-size:16px;font-weight:bold;color:#18181b;">Matriz<span style="color:#7c5cff;">/</span>Central</td>
    </tr></table>
  </td></tr>
  <tr><td style="font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
</table>`;
}

/** Parágrafo de dica de setup por tier — reusado pelos e-mails de ciclo/conteúdo.
 *  Sem tier, retorna string vazia (HTML idêntico ao anterior). */
function tierHint(tier?: CapacityTier): string {
  if (!tier) return "";
  const path = CAPACITY_PATHS[tier];
  return `<p>Para o seu caminho <strong>${path.publicName}</strong>: ${path.setup}</p>`;
}

/**
 * Formata um valor em centavos (o `amount_total` da Stripe) como moeda
 * brasileira. Retorna `null` quando não há valor confiável — o chamador deve
 * OMITIR a linha do valor em vez de imprimir algo errado.
 *
 * Formatação manual (e não `Intl.NumberFormat`) para o resultado não depender
 * do ICU disponível no runtime: o mesmo e-mail sai igual em qualquer ambiente.
 */
export function formatBrlFromCents(cents: number | null | undefined): string | null {
  if (typeof cents !== "number" || !Number.isFinite(cents)) return null;
  const rounded = Math.round(cents);
  const abs = Math.abs(rounded);
  const reais = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const centavos = String(abs % 100).padStart(2, "0");
  return `${rounded < 0 ? "-" : ""}R$ ${reais},${centavos}`;
}

/**
 * Bloco de resumo da contratação (Decreto 7.962/2013, art. 4º, VII): o que foi
 * adquirido, o valor pago, a janela de garantia e o link dos termos.
 *
 * Só pode ser anexado no caminho da COMPRA. Reenvio de acesso
 * (`resendAccessByEmail`) usa a mesma função de e-mail e não pode receber o
 * resumo — quem comprou há meses receberia o resumo de um contrato encerrado.
 *
 * O `siteUrl` recebe o mesmo guard de `emailShell`: sem `NEXT_PUBLIC_URL` a
 * linha do link some, em vez de sair `undefined/legal/termos#garantia`.
 */
export function purchaseSummaryBlock(
  item: string,
  amountTotalCents?: number | null,
  siteUrl: string | undefined = process.env.NEXT_PUBLIC_URL
): string {
  const termsUrl = siteUrl ? `${siteUrl}/legal/termos#garantia` : null;
  const price = formatBrlFromCents(amountTotalCents);
  return `
        <p><strong>Resumo da sua contratação</strong></p>
        <p>Item adquirido: ${item}.</p>${
          price ? `\n        <p>Valor pago: ${price}.</p>` : ""
        }
        <p>Garantia: 30 dias corridos a partir da liberação do acesso. Nos 7 primeiros dias você pode desistir sem precisar justificar (direito de arrependimento, art. 49 do CDC). Do 8º ao 30º dia a devolução é cortesia nossa e pressupõe que você estudou o material e ainda assim ele não serviu.</p>${
          termsUrl ? `\n        <p>Condições completas: <a href="${termsUrl}">${termsUrl}</a></p>` : ""
        }`;
}

export async function sendTokenEmail(params: {
  to: string;
  token: string;
  /** Só o caminho da compra anexa o resumo da contratação (ver bloco acima). */
  withSummary?: boolean;
  /** `session.amount_total` da Stripe, em centavos. Sem ele, o valor é omitido. */
  amountTotalCents?: number | null;
}): Promise<void> {
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
      subject: "Seu token chegou! Descubra seu perfil",
      htmlContent: emailShell(`
        <p>Seu acesso à Matriz Central está confirmado.</p>
        <p>Descubra seu perfil de aprendizado e desbloqueie seu roadmap personalizado:</p>
        <p><a href="${quizUrl}">${quizUrl}</a></p>
        ${params.withSummary ? purchaseSummaryBlock("acesso à Matriz Central", params.amountTotalCents) : ""}
      `),
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
      subject: `Você subiu de nível! Agora você é ${params.levelName}`,
      htmlContent: emailShell(`
        <p>Parabéns! Você atingiu o Nível ${params.level} — ${params.levelName}.</p>
        <p>Continue estudando para desbloquear o próximo nível.</p>
      `),
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
      subject: `Seu certificado está pronto: ${params.title}`,
      htmlContent: emailShell(`
        <p>Parabéns por concluir sua trilha!</p>
        <p>Certificado: ${params.title}</p>
        <p>Verifique a autenticidade em: <a href="${verificationUrl}">${verificationUrl}</a></p>
      `),
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
      subject: "Seu link de acesso à Matriz Central",
      htmlContent: emailShell(`
        <p>Recebemos um pedido para entrar na sua conta.</p>
        <p>Clique no link abaixo para acessar (válido por 15 minutos, uso único):</p>
        <p><a href="${loginUrl}">${loginUrl}</a></p>
        <p>Se não foi você, pode ignorar este e-mail.</p>
      `),
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
      htmlContent: emailShell(htmlContent),
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao enviar e-mail via Brevo: ${response.status} ${body}`);
  }
}

export async function sendPassPurchaseEmail(params: {
  to: string;
  plan: "regular" | "advanced";
  amountTotalCents?: number | null;
}): Promise<void> {
  const nome = params.plan === "advanced" ? "Advanced" : "Regular";
  await sendBrevo(
    params.to,
    `Seu passe ${nome} está ativo`,
    `<p>Seu passe <strong>${nome}</strong> foi ativado — 12 meses de acesso.</p>
     <p>Entre pela sua conta em <a href="${process.env.NEXT_PUBLIC_URL}/entrar">${process.env.NEXT_PUBLIC_URL}/entrar</a> e comece a consumir.</p>
     ${purchaseSummaryBlock(`Passe ${nome} — 12 meses de acesso`, params.amountTotalCents)}`
  );
}

export async function sendNewCycleEmail(params: { to: string; tier?: CapacityTier }): Promise<void> {
  await sendBrevo(
    params.to,
    "Novo ciclo: escolha seu conteúdo do mês",
    `<p>Seu novo ciclo abriu — você pode desbloquear <strong>mais 1 conteúdo</strong> este mês.</p>
     <p>Escolha em <a href="${process.env.NEXT_PUBLIC_URL}/conta">sua conta</a>.</p>${tierHint(params.tier)}`
  );
}

export async function sendNewContentEmail(params: { to: string; contentTitle: string; tier?: CapacityTier }): Promise<void> {
  await sendBrevo(
    params.to,
    "Novo conteúdo disponível na Matriz Central",
    `<p>Acabou de sair: <strong>${params.contentTitle}</strong>.</p>
     <p>Como Advanced, já está liberado pra você em <a href="${process.env.NEXT_PUBLIC_URL}/conta">sua conta</a>.</p>${tierHint(params.tier)}`
  );
}

export async function sendExpiryEmail(params: { to: string; daysLeft: number }): Promise<void> {
  await sendBrevo(
    params.to,
    `Seu passe expira em ${params.daysLeft} dia(s)`,
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
