// Supabase Edge Function: Process Disbursement
// Triggered after cooling-off period expires. Initiates fund transfer.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { loan_id } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch loan
  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loan_id)
    .single();

  if (!loan) {
    return new Response(JSON.stringify({ error: "Loan not found" }), { status: 404 });
  }

  // Enforce cooling-off period
  if (loan.status === "cooling_off") {
    const expiresAt = new Date(loan.cooling_off_expires_at);
    if (expiresAt > new Date()) {
      return new Response(JSON.stringify({
        error: "Cooling-off period still active",
        expires_at: loan.cooling_off_expires_at,
      }), { status: 400 });
    }
  }

  // Transition loan to active
  await supabase.from("loans")
    .update({
      status: "active",
      disbursement_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", loan_id);

  // Create disbursement record
  const { data: disbursement } = await supabase.from("disbursements").insert({
    loan_id,
    amount: loan.principal_amount,
    method: "eft",
    provider: "manual",
    status: "processing",
  }).select().single();

  // In production: integrate with payment provider (PAYM8, etc.)
  // Simulate completion
  await supabase.from("disbursements")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", disbursement.id);

  return new Response(JSON.stringify({
    disbursement_id: disbursement.id,
    status: "completed",
    amount: loan.principal_amount,
  }), { headers: { "Content-Type": "application/json" } });
});
