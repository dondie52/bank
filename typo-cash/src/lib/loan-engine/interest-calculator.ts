/**
 * SIMPLE INTEREST ONLY — Legal requirement under NBFIRA regulations.
 * Formula: interest = principal × (rate/100) × (termDays/365)
 * ALL math in BigInt. NEVER floating point for money. NEVER compound interest.
 */

export function calculateSimpleInterest(
  principalThebe: bigint,
  annualRatePercent: number,
  termDays: number
): bigint {
  if (principalThebe <= 0n || annualRatePercent <= 0 || termDays <= 0) {
    return 0n;
  }

  // Convert rate to basis points to avoid floating point
  // 12% → 1200 basis points
  const basisPoints = BigInt(Math.round(annualRatePercent * 100));
  // interest = principal × basisPoints × days / (10000 × 365)
  return (principalThebe * basisPoints * BigInt(termDays)) / (10000n * 365n);
}

export function calculateTotalRepayable(
  principalThebe: bigint,
  annualRatePercent: number,
  termDays: number,
  originationFeeThebe: bigint = 0n
): { interest: bigint; totalRepayable: bigint } {
  const interest = calculateSimpleInterest(principalThebe, annualRatePercent, termDays);
  const totalRepayable = principalThebe + interest + originationFeeThebe;
  return { interest, totalRepayable };
}
