// Supabase Edge Function: Process Application
// Full decisioning pipeline: validate → credit check → affordability → risk score → auto/manual/decline

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { application_id } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Fetch application and borrower
  const { data: application } = await supabase
    .from("loan_applications")
    .select("*, borrowers(*), loan_products(*)")
    .eq("id", application_id)
    .single();

  if (!application) {
    return new Response(JSON.stringify({ error: "Application not found" }), { status: 404 });
  }

  const borrower = application.borrowers;
  const product = application.loan_products;

  // 2. Credit check (simulated)
  const creditScore = Math.floor(Math.random() * 300) + 500; // 500-800
  const defaultCount = Math.floor(Math.random() * 3);

  await supabase.from("credit_checks").insert({
    borrower_id: borrower.id,
    application_id,
    bureau: "TransUnion Botswana",
    credit_score: creditScore,
    default_count: defaultCount,
    total_exposure: 0,
    consent_captured_at: new Date().toISOString(),
  });

  // 3. Affordability assessment - MANDATORY
  const netIncome = borrower.net_monthly_salary;
  const existingObligations = 0; // Would query active loans in production
  const proposedInstalment = application.requested_amount; // Simplified

  const disposableIncome = netIncome - existingObligations;
  const maxAffordableInstalment = Math.floor(disposableIncome * 0.3);
  const dti = netIncome > 0 ? (existingObligations + proposedInstalment) / netIncome : 1;

  const affordabilityResult = proposedInstalment <= maxAffordableInstalment && dti <= 0.6
    ? "pass"
    : dti <= 0.65 ? "marginal" : "fail";

  await supabase.from("affordability_assessments").insert({
    application_id,
    borrower_id: borrower.id,
    gross_income: netIncome,
    net_income: netIncome,
    existing_obligations: existingObligations,
    disposable_income: disposableIncome,
    max_affordable_instalment: maxAffordableInstalment,
    debt_to_income_ratio: dti,
    assessment_result: affordabilityResult,
  });

  // 4. Risk scoring
  const creditComponent = Math.min(creditScore / 10, 100);
  const affordabilityComponent = affordabilityResult === "pass" ? 90 : affordabilityResult === "marginal" ? 60 : 20;
  const employmentComponent = borrower.employer_name ? 80 : 40;
  const historyComponent = defaultCount === 0 ? 90 : defaultCount === 1 ? 60 : 30;
  const fraudComponent = 85; // Placeholder

  const compositeScore = (creditComponent * 0.3 + affordabilityComponent * 0.25 + employmentComponent * 0.2 + historyComponent * 0.15 + fraudComponent * 0.1);

  const riskBand = compositeScore >= 75 ? "low" : compositeScore >= 55 ? "medium" : compositeScore >= 35 ? "high" : "very_high";
  const decision = compositeScore >= 70 ? "auto_approve" : compositeScore >= 50 ? "manual_review" : "auto_decline";

  await supabase.from("risk_scores").insert({
    application_id,
    credit_component: creditComponent,
    affordability_component: affordabilityComponent,
    employment_component: employmentComponent,
    history_component: historyComponent,
    fraud_component: fraudComponent,
    composite_score: compositeScore,
    risk_band: riskBand,
    decision,
  });

  // 5. Decision
  if (affordabilityResult === "fail") {
    // MANDATORY: affordability blocks non-compliant loans
    await supabase.from("loan_applications")
      .update({
        status: "declined",
        decision_type: "auto",
        decision_reason: "Failed mandatory affordability assessment",
        decline_reason_code: "AFFORD_FAIL",
        decided_at: new Date().toISOString(),
        risk_score: compositeScore,
      })
      .eq("id", application_id);

    return new Response(JSON.stringify({ decision: "declined", reason: "affordability_fail" }));
  }

  const newStatus = decision === "auto_approve" ? "approved" : decision === "manual_review" ? "under_review" : "declined";

  await supabase.from("loan_applications")
    .update({
      status: newStatus,
      approved_amount: decision === "auto_approve" ? application.requested_amount : null,
      decision_type: decision === "manual_review" ? null : "auto",
      decision_reason: decision === "auto_decline" ? "Risk score below threshold" : null,
      decline_reason_code: decision === "auto_decline" ? "RISK_HIGH" : null,
      decided_at: decision !== "manual_review" ? new Date().toISOString() : null,
      risk_score: compositeScore,
    })
    .eq("id", application_id);

  return new Response(JSON.stringify({
    decision: newStatus,
    risk_score: compositeScore,
    risk_band: riskBand,
    affordability: affordabilityResult,
  }), { headers: { "Content-Type": "application/json" } });
});
