import { describe, it, expect } from "vitest";
import { calculateSimpleInterest } from "@/lib/loan-engine/interest-calculator";

describe("calculateSimpleInterest", () => {
  it("P1000 at 12% for 30 days = 986 thebe", () => {
    // 100000 thebe × 1200bp × 30 / (10000 × 365) = 986.30... → 986
    const result = calculateSimpleInterest(100000n, 12, 30);
    expect(result).toBe(986n);
  });

  it("P5000 at 18% for 90 days = 22192 thebe", () => {
    // 500000 × 1800 × 90 / (10000 × 365) = 22191.78... → 22191
    const result = calculateSimpleInterest(500000n, 18, 90);
    expect(result).toBe(22191n);
  });

  it("0% rate returns 0", () => {
    expect(calculateSimpleInterest(100000n, 0, 30)).toBe(0n);
  });

  it("1 day term", () => {
    // 100000 × 1200 × 1 / (10000 × 365) = 32.87... → 32
    const result = calculateSimpleInterest(100000n, 12, 1);
    expect(result).toBe(32n);
  });

  it("zero principal returns 0", () => {
    expect(calculateSimpleInterest(0n, 12, 30)).toBe(0n);
  });

  it("negative principal returns 0", () => {
    expect(calculateSimpleInterest(-100000n, 12, 30)).toBe(0n);
  });
});
