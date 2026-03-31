"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface SubmitLoanInput {
  productCode: string;
  productName: string;
  interestRate: number;
  principalThebe: number;
  interestThebe: number;
  originationFeeThebe: number;
  totalRepayableThebe: number;
  termDays: number;
}

export async function submitLoanApplication(input: SubmitLoanInput) {
  const supabase = createServiceRoleClient();

  // Try to get the authenticated user first
  const authClient = createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();

  // Find borrower profile
  let borrowerId: string;
  if (user) {
    const { data: borrower } = await supabase
      .from("borrowers")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!borrower) {
      return { error: "Borrower profile not found. Please complete registration." };
    }
    borrowerId = borrower.id;
  } else {
    // Demo mode: use first available borrower
    const { data: demoBorrower } = await supabase
      .from("borrowers")
      .select("id")
      .limit(1)
      .single();
    if (!demoBorrower) {
      return { error: "No borrower profiles found. Please seed the database." };
    }
    borrowerId = demoBorrower.id;
  }

  // Look up the actual product UUID
  const { data: dbProduct } = await supabase
    .from("loan_products")
    .select("id")
    .eq("code", input.productCode)
    .single();
  if (!dbProduct) {
    return { error: "Loan product not found in database." };
  }

  // 1. Insert loan application
  const { data: application, error: appError } = await supabase
    .from("loan_applications")
    .insert({
      borrower_id: borrowerId,
      product_id: dbProduct.id,
      requested_amount: input.principalThebe,
      approved_amount: input.principalThebe,
      term_days: input.termDays,
      status: "approved",
      risk_score: 75.0,
      decision_type: "auto",
      decision_reason: "Auto-approved: MVP demo mode",
      submitted_at: new Date().toISOString(),
      decided_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (appError) {
    return { error: appError.message };
  }

  // 2. Generate reference number
  const now = new Date();
  const prefix = `TC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-`;
  const { count } = await supabase
    .from("loans")
    .select("id", { count: "exact", head: true })
    .like("reference_number", `${prefix}%`);
  const refNumber = `${prefix}${String((count ?? 0) + 1).padStart(5, "0")}`;

  // 3. Calculate maturity date and cooling-off expiry
  const maturityDate = new Date(now);
  maturityDate.setDate(maturityDate.getDate() + input.termDays);

  const coolingOffExpiry = new Date(now);
  coolingOffExpiry.setHours(coolingOffExpiry.getHours() + 48);

  // 4. Create loan record
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .insert({
      application_id: application.id,
      borrower_id: borrowerId,
      product_id: dbProduct.id,
      reference_number: refNumber,
      principal_amount: input.principalThebe,
      interest_amount: input.interestThebe,
      origination_fee: input.originationFeeThebe,
      total_repayable: input.totalRepayableThebe,
      interest_rate_percent: input.interestRate,
      term_days: input.termDays,
      maturity_date: maturityDate.toISOString().split("T")[0],
      status: "approved",
      outstanding_principal: input.principalThebe,
      outstanding_interest: input.interestThebe,
      outstanding_penalties: 0,
      total_paid: 0,
      days_overdue: 0,
      cooling_off_expires_at: coolingOffExpiry.toISOString(),
    })
    .select()
    .single();

  if (loanError) {
    return { error: loanError.message };
  }

  // 5. Generate repayment schedule
  const numInstalments = input.termDays <= 30 ? 1 : Math.ceil(input.termDays / 30);
  const basePrincipal = Math.floor(input.principalThebe / numInstalments);
  const baseInterest = Math.floor(input.interestThebe / numInstalments);
  const intervalDays = Math.ceil(input.termDays / numInstalments);

  const scheduleEntries = [];
  for (let i = 1; i <= numInstalments; i++) {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + intervalDays * i);

    const isLast = i === numInstalments;
    const princ = isLast ? input.principalThebe - basePrincipal * (numInstalments - 1) : basePrincipal;
    const intr = isLast ? input.interestThebe - baseInterest * (numInstalments - 1) : baseInterest;

    scheduleEntries.push({
      loan_id: loan.id,
      instalment_number: i,
      due_date: dueDate.toISOString().split("T")[0],
      principal_component: princ,
      interest_component: intr,
      total_due: princ + intr,
      status: "pending",
      paid_amount: 0,
    });
  }

  const { error: schedError } = await supabase
    .from("repayment_schedules")
    .insert(scheduleEntries);

  if (schedError) {
    return { error: schedError.message };
  }

  return {
    success: true,
    referenceNumber: refNumber,
    loanId: loan.id,
  };
}
