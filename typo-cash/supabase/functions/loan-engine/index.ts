// Supabase Edge Function: Loan Engine
// Provides interest calculation, schedule generation, and penalty computation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface LoanEngineRequest {
  action: "calculate_interest" | "generate_schedule" | "calculate_penalty";
  principal_thebe: number;
  annual_rate_percent: number;
  term_days: number;
  num_instalments?: number;
  start_date?: string;
  outstanding_principal?: number;
  original_principal?: number;
  cumulative_interest?: number;
  cumulative_penalties?: number;
  penalty_rate?: number;
}

serve(async (req) => {
  const body: LoanEngineRequest = await req.json();

  if (body.action === "calculate_interest") {
    const principal = BigInt(body.principal_thebe);
    const basisPoints = BigInt(Math.round(body.annual_rate_percent * 100));
    const interest = (principal * basisPoints * BigInt(body.term_days)) / (10000n * 365n);

    return new Response(JSON.stringify({
      interest_thebe: interest.toString(),
      total_repayable_thebe: (principal + interest).toString(),
    }), { headers: { "Content-Type": "application/json" } });
  }

  if (body.action === "generate_schedule") {
    const principal = BigInt(body.principal_thebe);
    const basisPoints = BigInt(Math.round(body.annual_rate_percent * 100));
    const totalInterest = (principal * basisPoints * BigInt(body.term_days)) / (10000n * 365n);
    const totalRepayable = principal + totalInterest;
    const numInstalments = body.num_instalments || 1;

    const baseInstalment = totalRepayable / BigInt(numInstalments);
    const basePrincipal = principal / BigInt(numInstalments);
    const baseInterest = totalInterest / BigInt(numInstalments);
    const principalRemainder = principal - basePrincipal * BigInt(numInstalments);
    const interestRemainder = totalInterest - baseInterest * BigInt(numInstalments);

    const intervalDays = Math.ceil(body.term_days / numInstalments);
    const startDate = new Date(body.start_date || Date.now());
    const schedule = [];

    for (let i = 1; i <= numInstalments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + intervalDays * i);
      const isLast = i === numInstalments;

      schedule.push({
        instalment_number: i,
        due_date: dueDate.toISOString().split("T")[0],
        principal_component: (isLast ? basePrincipal + principalRemainder : basePrincipal).toString(),
        interest_component: (isLast ? baseInterest + interestRemainder : baseInterest).toString(),
        total_due: (isLast ? baseInstalment + (totalRepayable - baseInstalment * BigInt(numInstalments)) : baseInstalment).toString(),
      });
    }

    return new Response(JSON.stringify({ schedule }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body.action === "calculate_penalty") {
    const outstanding = BigInt(body.outstanding_principal || 0);
    const original = BigInt(body.original_principal || 0);
    const cumInterest = BigInt(body.cumulative_interest || 0);
    const cumPenalties = BigInt(body.cumulative_penalties || 0);
    const rate = Math.min(body.penalty_rate || 5.0, 5.0);

    const rateBasis = BigInt(Math.round(rate * 100));
    const cap1 = (outstanding * rateBasis) / 10000n;
    const cap2 = outstanding - cumPenalties;
    const cap3 = original - cumInterest - cumPenalties;

    const penalty = [cap1, cap2, cap3].reduce((min, v) => v < min ? v : min);
    const result = penalty > 0n ? penalty : 0n;

    return new Response(JSON.stringify({
      penalty_thebe: result.toString(),
      cap_reached: result === 0n,
    }), { headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Unknown action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
});
