/**
 * All monetary values are stored as BIGINT in thebe (100 thebe = 1 Pula).
 * This module provides conversion and formatting utilities.
 * NEVER use floating point for money calculations.
 */

export function thebeToPlua(thebe: bigint): string {
  const isNegative = thebe < 0n;
  const abs = isNegative ? -thebe : thebe;
  const pula = abs / 100n;
  const remaining = abs % 100n;
  const sign = isNegative ? "-" : "";
  return `${sign}${pula}.${remaining.toString().padStart(2, "0")}`;
}

export function formatMoney(thebe: bigint): string {
  const isNegative = thebe < 0n;
  const abs = isNegative ? -thebe : thebe;
  const pula = abs / 100n;
  const remaining = abs % 100n;
  const formatted = pula.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = isNegative ? "-" : "";
  return `${sign}P${formatted}.${remaining.toString().padStart(2, "0")}`;
}

export function pulaToThebe(pula: number): bigint {
  return BigInt(Math.round(pula * 100));
}

export function parseMoney(input: string): bigint {
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0n;
  return BigInt(Math.round(num * 100));
}

export function formatMoneyShort(thebe: bigint): string {
  const pula = Number(thebe) / 100;
  if (pula >= 1000) {
    return `P${(pula / 1000).toFixed(1)}k`;
  }
  return formatMoney(thebe);
}
