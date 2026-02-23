const BGN_TO_EUR_RATE = 1.9558;

export function bgnToEur(bgn: number): number {
  return Math.round((bgn / BGN_TO_EUR_RATE) * 100) / 100;
}

export function eurToBgn(eur: number): number {
  return Math.round(eur * BGN_TO_EUR_RATE);
}

export function formatBgn(amount: number): string {
  return `${amount} лв.`;
}

export function formatEur(amount: number): string {
  return `${amount} EUR`;
}
