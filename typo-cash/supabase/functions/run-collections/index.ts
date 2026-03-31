// Supabase Edge Function: Run Collections
// Scheduled: detect overdue, send reminders, apply penalties, escalate stages

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date().toISOString().split("T")[0];

  // 1. Find active loans past maturity
  const { data: overdueLoans } = await supabase
    .from("loans")
    .select("*")
    .eq("status", "active")
    .lt("maturity_date", today);

  const results = { transitioned: 0, penalties_applied: 0, reminders_sent: 0 };

  for (const loan of (overdueLoans || [])) {
    // Transition to overdue
    await supabase.from("loans")
      .update({
        status: "overdue",
        days_overdue: Math.floor((Date.now() - new Date(loan.maturity_date).getTime()) / 86400000),
      })
      .eq("id", loan.id);
    results.transitioned++;
  }

  // 2. Update days_overdue for already-overdue loans
  const { data: existingOverdue } = await supabase
    .from("loans")
    .select("*")
    .in("status", ["overdue", "collections"]);

  for (const loan of (existingOverdue || [])) {
    const daysOverdue = Math.floor((Date.now() - new Date(loan.maturity_date).getTime()) / 86400000);

    await supabase.from("loans")
      .update({ days_overdue: Math.max(0, daysOverdue) })
      .eq("id", loan.id);

    // Apply monthly penalty (once per 30-day period)
    if (daysOverdue > 0 && daysOverdue % 30 < 1) {
      const outstanding = BigInt(loan.outstanding_principal);
      const original = BigInt(loan.principal_amount);
      const cumInterest = BigInt(loan.interest_amount);
      const cumPenalties = BigInt(loan.outstanding_penalties);

      // Three caps
      const cap1 = (outstanding * 500n) / 10000n; // 5%
      const cap2 = outstanding - cumPenalties;
      const cap3 = original - cumInterest - cumPenalties;
      const penalty = [cap1, cap2, cap3].reduce((min, v) => v < min ? v : min);
      const finalPenalty = penalty > 0n ? penalty : 0n;

      if (finalPenalty > 0n) {
        await supabase.from("penalties").insert({
          loan_id: loan.id,
          amount: finalPenalty.toString(),
          rate_applied: 5.0,
          outstanding_principal_at_time: outstanding.toString(),
          cumulative_penalties_after: (cumPenalties + finalPenalty).toString(),
          cap_reached: finalPenalty === 0n,
        });

        await supabase.from("loans")
          .update({
            outstanding_penalties: (cumPenalties + finalPenalty).toString(),
          })
          .eq("id", loan.id);

        results.penalties_applied++;
      }
    }

    // Escalate stages based on days overdue
    if (daysOverdue >= 90 && loan.status === "overdue") {
      await supabase.from("loans")
        .update({ status: "collections" })
        .eq("id", loan.id);

      // Create collections case if not exists
      const { data: existing } = await supabase
        .from("collections_cases")
        .select("id")
        .eq("loan_id", loan.id)
        .eq("status", "open")
        .single();

      if (!existing) {
        await supabase.from("collections_cases").insert({
          loan_id: loan.id,
          borrower_id: loan.borrower_id,
          stage: "early",
          actions_taken: [],
        });
      }
    }
  }

  return new Response(JSON.stringify({
    success: true,
    ...results,
    timestamp: new Date().toISOString(),
  }), { headers: { "Content-Type": "application/json" } });
});
