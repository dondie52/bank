// Supabase Edge Function: Sign Agreement
// Records signature, sets cooling_off_expires_at, creates loan record

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { application_id, otp } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch approved application
  const { data: app } = await supabase
    .from("loan_applications")
    .select("*, loan_products(*)")
    .eq("id", application_id)
    .eq("status", "approved")
    .single();

  if (!app) {
    return new Response(JSON.stringify({ error: "Application not found or not approved" }), { status: 404 });
  }

  // TODO: Verify OTP in production

  // Calculate loan details
  const principal = BigInt(app.approved_amount);
  const rate = app.loan_products.interest_rate_percent;
  const basisPoints = BigInt(Math.round(rate * 100));
  const interest = (principal * basisPoints * BigInt(app.term_days)) / (10000n * 365n);
  const originationFee = BigInt(app.loan_products.origination_fee);
  const totalRepayable = principal + interest + originationFee;

  // Generate reference number
  const { data: refData } = await supabase.rpc("generate_reference_number");
  const referenceNumber = refData || `TC-${new Date().toISOString().slice(0, 7).replace("-", "")}-00001`;

  // Cooling-off: 48 hours from now
  const coolingOffExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + app.term_days + 2); // +2 for cooling off

  // Create loan record
  const { data: loan, error } = await supabase.from("loans").insert({
    application_id,
    borrower_id: app.borrower_id,
    product_id: app.product_id,
    reference_number: referenceNumber,
    principal_amount: principal.toString(),
    interest_amount: interest.toString(),
    origination_fee: originationFee.toString(),
    total_repayable: totalRepayable.toString(),
    interest_rate_percent: rate,
    term_days: app.term_days,
    maturity_date: maturityDate.toISOString().split("T")[0],
    status: "cooling_off",
    outstanding_principal: principal.toString(),
    outstanding_interest: interest.toString(),
    outstanding_penalties: "0",
    total_paid: "0",
    days_overdue: 0,
    cooling_off_expires_at: coolingOffExpires.toISOString(),
  }).select().single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({
    loan_id: loan.id,
    reference_number: referenceNumber,
    cooling_off_expires_at: coolingOffExpires.toISOString(),
    total_repayable: totalRepayable.toString(),
  }), { headers: { "Content-Type": "application/json" } });
});
