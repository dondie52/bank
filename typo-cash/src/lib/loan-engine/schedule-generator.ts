/**
 * Repayment Schedule Generator
 * Equal instalments with remainder in the last instalment.
 */

import { calculateSimpleInterest } from "./interest-calculator";

export interface ScheduleEntry {
  instalmentNumber: number;
  dueDate: string;
  principalComponent: bigint;
  interestComponent: bigint;
  totalDue: bigint;
}

export function generateRepaymentSchedule(
  principalThebe: bigint,
  annualRatePercent: number,
  termDays: number,
  numInstalments: number,
  startDate: Date
): ScheduleEntry[] {
  if (numInstalments <= 0) return [];

  const totalInterest = calculateSimpleInterest(principalThebe, annualRatePercent, termDays);

  // Split principal and interest proportionally across instalments
  const basePrincipal = principalThebe / BigInt(numInstalments);
  const baseInterest = totalInterest / BigInt(numInstalments);

  const principalRemainder = principalThebe - basePrincipal * BigInt(numInstalments);
  const interestRemainder = totalInterest - baseInterest * BigInt(numInstalments);

  const intervalDays = Math.ceil(termDays / numInstalments);
  const schedule: ScheduleEntry[] = [];

  for (let i = 1; i <= numInstalments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + intervalDays * i);

    const isLast = i === numInstalments;
    const principal = isLast ? basePrincipal + principalRemainder : basePrincipal;
    const interest = isLast ? baseInterest + interestRemainder : baseInterest;

    schedule.push({
      instalmentNumber: i,
      dueDate: dueDate.toISOString().split("T")[0],
      principalComponent: principal,
      interestComponent: interest,
      totalDue: principal + interest,
    });
  }

  return schedule;
}
