import { describe, it, expect } from "vitest";
import { generateRepaymentSchedule } from "@/lib/loan-engine/schedule-generator";

describe("generateRepaymentSchedule", () => {
  it("3 instalments sum to total repayable", () => {
    const schedule = generateRepaymentSchedule(
      300000n, // P3,000
      12,
      90,
      3,
      new Date("2026-01-01")
    );

    expect(schedule).toHaveLength(3);

    const totalPrincipal = schedule.reduce((sum, s) => sum + s.principalComponent, 0n);
    const totalInterest = schedule.reduce((sum, s) => sum + s.interestComponent, 0n);

    expect(totalPrincipal).toBe(300000n);
    // Interest = 300000 × 1200 × 90 / (10000 × 365) = 8876n
    expect(totalInterest).toBe(8876n);

    const totalDue = schedule.reduce((sum, s) => sum + s.totalDue, 0n);
    expect(totalDue).toBe(300000n + 8876n);
  });

  it("remainder goes in last instalment", () => {
    const schedule = generateRepaymentSchedule(
      100000n,
      12,
      90,
      3,
      new Date("2026-01-01")
    );

    // Principal: 100000 / 3 = 33333 per instalment, remainder = 1
    // Last instalment gets 33333 + 1 = 33334
    expect(schedule[0].principalComponent).toBe(33333n);
    expect(schedule[1].principalComponent).toBe(33333n);
    expect(schedule[2].principalComponent).toBe(33334n);

    const total = schedule.reduce((sum, s) => sum + s.principalComponent, 0n);
    expect(total).toBe(100000n);
  });

  it("single instalment returns full amount", () => {
    const schedule = generateRepaymentSchedule(
      50000n,
      12,
      30,
      1,
      new Date("2026-03-01")
    );

    expect(schedule).toHaveLength(1);
    expect(schedule[0].principalComponent).toBe(50000n);
    expect(schedule[0].instalmentNumber).toBe(1);
  });

  it("due dates are correctly spaced", () => {
    const schedule = generateRepaymentSchedule(
      100000n,
      12,
      90,
      3,
      new Date("2026-01-01")
    );

    expect(schedule[0].dueDate).toBe("2026-01-31");
    expect(schedule[1].dueDate).toBe("2026-03-02");
    expect(schedule[2].dueDate).toBe("2026-04-01");
  });

  it("zero instalments returns empty array", () => {
    const schedule = generateRepaymentSchedule(100000n, 12, 30, 0, new Date());
    expect(schedule).toHaveLength(0);
  });
});
