// Supabase Edge Function: Process Repayment
// Applies payment to loan: penalties first → interest → principal

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { loan_id, amount_thebe, payment_method, payment_reference } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loan_id)
    .single();

  if (!loan) {
    return new Response(JSON.stringify({ error: "Loan not found" }), { status: 404 });
  }

  let remaining = BigInt(amount_thebe);
  let appliedToPenalties = 0n;
  let appliedToInterest = 0n;
  let appliedToPrincipal = 0n;

  // Apply to penalties first
  const outstandingPenalties = BigInt(loan.outstanding_penalties);
  if (remaining > 0n && outstandingPenalties > 0n) {
    const penaltyPayment = remaining < outstandingPenalties ? remaining : outstandingPenalties;
    appliedToPenalties = penaltyPayment;
    remaining -= penaltyPayment;
  }

  // Apply to interest next
  const outstandingInterest = BigInt(loan.outstanding_interest);
  if (remaining > 0n && outstandingInterest > 0n) {
    const interestPayment = remaining < outstandingInterest ? remaining : outstandingInterest;
    appliedToInterest = interestPayment;
    remaining -= interestPayment;
  }

  // Apply remainder to principal
  const outstandingPrincipal = BigInt(loan.outstanding_principal);
  if (remaining > 0n && outstandingPrincipal > 0n) {
    const principalPayment = remaining < outstandingPrincipal ? remaining : outstandingPrincipal;
    appliedToPrincipal = principalPayment;
    remaining -= principalPayment;
  }

  // Record repayment
  await supabase.from("repayments").insert({
    loan_id,
    amount: amount_thebe,
    payment_method: payment_method || "eft",
    payment_reference,
    applied_to_principal: appliedToPrincipal.toString(),
    applied_to_interest: appliedToInterest.toString(),
    applied_to_penalties: appliedToPenalties.toString(),
    status: "completed",
  });

  // Update loan balances
  const newPrincipal = outstandingPrincipal - appliedToPrincipal;
  const newInterest = outstandingInterest - appliedToInterest;
  const newPenalties = outstandingPenalties - appliedToPenalties;
  const newTotalPaid = BigInt(loan.total_paid) + BigInt(amount_thebe);

  const isFullyPaid = newPrincipal <= 0n && newInterest <= 0n && newPenalties <= 0n;

  await supabase.from("loans")
    .update({
      outstanding_principal: newPrincipal.toString(),
      outstanding_interest: newInterest.toString(),
      outstanding_penalties: newPenalties.toString(),
      total_paid: newTotalPaid.toString(),
      status: isFullyPaid ? "closed" : loan.status,
      closed_at: isFullyPaid ? new Date().toISOString() : null,
    })
    .eq("id", loan_id);

  return new Response(JSON.stringify({
    applied_to_principal: appliedToPrincipal.toString(),
    applied_to_interest: appliedToInterest.toString(),
    applied_to_penalties: appliedToPenalties.toString(),
    overpayment: remaining.toString(),
    loan_status: isFullyPaid ? "closed" : loan.status,
  }), { headers: { "Content-Type": "application/json" } });
});
