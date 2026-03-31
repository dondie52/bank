import { createClient } from "./client";

const supabase = () => createClient();

// ─── Borrower Queries ───────────────────────────────────────

export async function fetchBorrowerByUserId(userId: string) {
  const { data } = await supabase()
    .from("borrowers")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

export async function fetchBorrowerById(id: string) {
  const { data } = await supabase()
    .from("borrowers")
    .select("*, users(mobile_number, email, status), kyc_profiles(*)")
    .eq("id", id)
    .single();
  return data;
}

export async function fetchAllBorrowers() {
  const { data } = await supabase()
    .from("borrowers")
    .select("*, users(mobile_number, status), kyc_profiles(verification_status)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ─── Loan Queries ───────────────────────────────────────────

export async function fetchMyLoans() {
  const { data } = await supabase()
    .from("loans")
    .select("*, loan_products(name, code)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchLoanById(id: string) {
  const { data } = await supabase()
    .from("loans")
    .select("*, loan_products(name, code), repayment_schedules(*), repayments(*)")
    .eq("id", id)
    .single();
  return data;
}

export async function fetchAllLoans() {
  const { data } = await supabase()
    .from("loans")
    .select("*, borrowers(first_name, last_name), loan_products(name, code)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ─── Application Queries ────────────────────────────────────

export async function fetchMyApplications() {
  const { data } = await supabase()
    .from("loan_applications")
    .select("*, loan_products(name, code)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchAllApplications() {
  const { data } = await supabase()
    .from("loan_applications")
    .select("*, borrowers(first_name, last_name, omang_number), loan_products(name, code)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchApplicationById(id: string) {
  const { data } = await supabase()
    .from("loan_applications")
    .select("*, borrowers(*, users(mobile_number, email)), loan_products(*), risk_scores(*), affordability_assessments(*), credit_checks(*)")
    .eq("id", id)
    .single();
  return data;
}

// ─── Repayment / Payment Queries ────────────────────────────

export async function fetchMyPayments() {
  const { data } = await supabase()
    .from("repayments")
    .select("*, loans(reference_number)")
    .order("received_at", { ascending: false });
  return data ?? [];
}

export async function fetchDisbursements() {
  const { data } = await supabase()
    .from("disbursements")
    .select("*, loans(reference_number, borrowers(first_name, last_name))")
    .order("initiated_at", { ascending: false });
  return data ?? [];
}

// ─── Disputes ───────────────────────────────────────────────

export async function fetchMyDisputes() {
  const { data } = await supabase()
    .from("disputes")
    .select("*, loans(reference_number)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchAllDisputes() {
  const { data } = await supabase()
    .from("disputes")
    .select("*, loans(reference_number), borrowers(first_name, last_name)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createDispute(dispute: {
  loan_id: string;
  borrower_id: string;
  category: string;
  description: string;
  disputed_amount?: number;
}) {
  const { data, error } = await supabase().from("disputes").insert(dispute).select().single();
  if (error) throw error;
  return data;
}

// ─── Notifications ──────────────────────────────────────────

export async function fetchMyNotifications() {
  const { data } = await supabase()
    .from("notifications")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

// ─── Collections ────────────────────────────────────────────

export async function fetchCollectionsCases() {
  const { data } = await supabase()
    .from("collections_cases")
    .select("*, loans(reference_number, outstanding_principal, days_overdue), borrowers(first_name, last_name)")
    .order("next_action_date", { ascending: true });
  return data ?? [];
}

// ─── Compliance ─────────────────────────────────────────────

export async function fetchComplianceFlags() {
  const { data } = await supabase()
    .from("compliance_flags")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ─── Audit Logs ─────────────────────────────────────────────

export async function fetchAuditLogs(page = 0, pageSize = 20) {
  const { data, count } = await supabase()
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  return { data: data ?? [], count: count ?? 0 };
}

// ─── KYC ────────────────────────────────────────────────────

export async function fetchKycQueue() {
  const { data } = await supabase()
    .from("kyc_profiles")
    .select("*, borrowers(first_name, last_name, omang_number, documents(*))")
    .eq("verification_status", "pending")
    .order("borrower_id");
  return data ?? [];
}

// ─── Admin Users ────────────────────────────────────────────

export async function fetchAdminUsers() {
  const { data } = await supabase()
    .from("admin_users")
    .select("*, users(mobile_number, email)")
    .order("first_name");
  return data ?? [];
}

// ─── Loan Products ──────────────────────────────────────────

export async function fetchLoanProducts() {
  const { data } = await supabase()
    .from("loan_products")
    .select("*")
    .order("name");
  return data ?? [];
}

// ─── Admin Dashboard KPIs ───────────────────────────────────

export async function fetchAdminKPIs() {
  const s = supabase();

  const [activeLoans, overdueLoans, allLoans, pendingApps] = await Promise.all([
    s.from("loans").select("id, outstanding_principal", { count: "exact" }).eq("status", "active"),
    s.from("loans").select("id, outstanding_principal", { count: "exact" }).eq("status", "overdue"),
    s.from("loans").select("id, outstanding_principal, total_paid, total_repayable", { count: "exact" }).in("status", ["active", "overdue", "collections"]),
    s.from("loan_applications").select("id", { count: "exact" }).in("status", ["submitted", "under_review"]),
  ]);

  const totalOutstanding = (allLoans.data ?? []).reduce(
    (sum: number, l: { outstanding_principal: number }) => sum + (l.outstanding_principal ?? 0), 0
  );

  const totalCollected = (allLoans.data ?? []).reduce(
    (sum: number, l: { total_paid: number }) => sum + (l.total_paid ?? 0), 0
  );

  const totalRepayable = (allLoans.data ?? []).reduce(
    (sum: number, l: { total_repayable: number }) => sum + (l.total_repayable ?? 0), 0
  );

  return {
    activeLoansCount: activeLoans.count ?? 0,
    overdueCount: overdueLoans.count ?? 0,
    totalOutstanding,
    collectionRate: totalRepayable > 0 ? (totalCollected / totalRepayable) * 100 : 0,
    par30: allLoans.count && allLoans.count > 0
      ? ((overdueLoans.count ?? 0) / allLoans.count) * 100
      : 0,
    pendingApplications: pendingApps.count ?? 0,
  };
}
