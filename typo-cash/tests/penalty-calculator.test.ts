import { describe, it, expect } from "vitest";
import { calculatePenalty, isPenaltyCapReached } from "@/lib/loan-engine/penalty-calculator";

describe("calculatePenalty", () => {
  it("applies 5% cap on outstanding principal", () => {
    // 5% of 100000 = 5000
    const result = calculatePenalty(100000n, 200000n, 10000n, 0n, 5.0);
    expect(result).toBe(5000n);
  });

  it("caps rate at 5% even if higher rate requested", () => {
    const result = calculatePenalty(100000n, 200000n, 10000n, 0n, 10.0);
    // Should still be 5% = 5000
    expect(result).toBe(5000n);
  });

  it("cumulative cap: penalties cannot exceed outstanding principal", () => {
    // Outstanding: 10000, already accumulated: 8000, so max 2000 more
    const result = calculatePenalty(10000n, 100000n, 5000n, 8000n, 5.0);
    // Cap 1: 5% of 10000 = 500
    // Cap 2: 10000 - 8000 = 2000
    // Cap 3: 100000 - 5000 - 8000 = 87000
    // Min = 500
    expect(result).toBe(500n);
  });

  it("cumulative cap hit returns limited amount", () => {
    // Outstanding: 10000, already accumulated: 9800
    const result = calculatePenalty(10000n, 100000n, 5000n, 9800n, 5.0);
    // Cap 1: 500, Cap 2: 200, Cap 3: 85200
    expect(result).toBe(200n);
  });

  it("in duplum cap: interest + penalties cannot exceed original principal", () => {
    // Original: 100000, interest: 80000, penalties: 15000
    // Cap 3: 100000 - 80000 - 15000 = 5000
    // Cap 1: 5% of 200000 = 10000
    // Cap 2: 200000 - 15000 = 185000
    const result = calculatePenalty(200000n, 100000n, 80000n, 15000n, 5.0);
    expect(result).toBe(5000n);
  });

  it("already-at-cap returns 0", () => {
    // interest + penalties already equal original principal
    const result = calculatePenalty(100000n, 100000n, 60000n, 40000n, 5.0);
    // Cap 3: 100000 - 60000 - 40000 = 0
    expect(result).toBe(0n);
  });

  it("isPenaltyCapReached returns true when at cap", () => {
    expect(isPenaltyCapReached(100000n, 100000n, 60000n, 40000n)).toBe(true);
  });

  it("isPenaltyCapReached returns false when not at cap", () => {
    expect(isPenaltyCapReached(100000n, 200000n, 10000n, 0n)).toBe(false);
  });

  it("zero outstanding returns 0", () => {
    expect(calculatePenalty(0n, 100000n, 50000n, 0n)).toBe(0n);
  });
});
