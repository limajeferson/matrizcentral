// Estimativa: ChatGPT Plus (~R$110/mês) + Claude Pro (~R$110/mês)
export const MONTHLY_AI_SUBSCRIPTIONS_BRL = 220;

export function annualSpendBRL(monthly: number = MONTHLY_AI_SUBSCRIPTIONS_BRL): number {
  return monthly * 12;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}
