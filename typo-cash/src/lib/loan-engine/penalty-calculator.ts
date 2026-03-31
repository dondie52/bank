/**
 * Penalty Calculator — THREE HARD CAPS, all enforced. No admin override.
 *
 * Cap 1: Max 5% of outstanding principal per month
 * Cap 2: Cumulative penalties MUST NOT exceed outstanding principal
 * Cap 3: In duplum — (interest + penalties) MUST NOT exceed original principal
 *
 * Returns the minimum allowed by all three caps.
 */

export function calculatePenalty(
  outstandingPrincipal: bigint,
  originalPrincipal: bigint,
  cumulativeInterest: bigint,
  cumulativePenalties: bigint,
  penaltyRatePercent: number = 5.0
): bigint {
  if (outstandingPrincipal <= 0n) return 0n;

  // Enforce max rate of 5%
  const effectiveRate = Math.min(penaltyRatePercent, 5.0);
  const rateBasis = BigInt(Math.round(effectiveRate * 100));

  // Cap 1: max 5% of outstanding principal per month
  const cap1 = (outstandingPrincipal * rateBasis) / 10000n;

  // Cap 2: cumulative penalties must not exceed outstanding principal
  const cap2 = outstandingPrincipal - cumulativePenalties;

  // Cap 3: in duplum — (interest + penalties) must not exceed original principal
  const cap3 = originalPrincipal - cumulativeInterest - cumulativePenalties;

  // Return the minimum of all three, but never negative
  const penalty = bigintMin(cap1, bigintMin(cap2, cap3));
  return penalty > 0n ? penalty : 0n;
}

function bigintMin(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export function isPenaltyCapReached(
  outstandingPrincipal: bigint,
  originalPrincipal: bigint,
  cumulativeInterest: bigint,
  cumulativePenalties: bigint
): boolean {
  return calculatePenalty(
    outstandingPrincipal,
    originalPrincipal,
    cumulativeInterest,
    cumulativePenalties
  ) === 0n;
}
