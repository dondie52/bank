export type UserRole = "borrower" | "admin";
export type BorrowerTier = "new" | "bronze" | "silver" | "gold";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed";
export type KycStatus = "pending" | "verified" | "rejected" | "expired";
export type DocumentType = "omang_front" | "omang_back" | "selfie" | "payslip" | "bank_statement" | "proof_of_residence" | "employment_letter";

export type LoanStatus =
  | "draft"
  | "approved"
  | "cooling_off"
  | "active"
  | "overdue"
  | "collections"
  | "restructured"
  | "closed"
  | "written_off"
  | "cancelled";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "declined"
  | "expired"
  | "cancelled";

export type PaymentMethod = "eft" | "debit_order" | "mobile_money" | "card" | "cash";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "reversed";
export type PaymentProvider = "paym8" | "orange_money" | "mascom_myzaka" | "manual";
export type MandateType = "debit_order" | "stop_order";
export type ScheduleStatus = "pending" | "paid" | "partial" | "overdue" | "waived";
export type CollectionsStage = "early" | "mid" | "late" | "legal" | "write_off";
export type DisputeCategory = "billing_error" | "unauthorized_debit" | "incorrect_balance" | "fee_dispute" | "service_complaint" | "other";
export type DisputeStatus = "open" | "investigating" | "resolved" | "escalated" | "closed";
export type NotificationChannel = "sms" | "email" | "push" | "whatsapp";
export type AdminRole = "super_admin" | "manager" | "credit_officer" | "collections_agent" | "kyc_reviewer" | "support";
export type FlagType = "aml" | "fraud" | "compliance" | "affordability" | "duplicate" | "sanctions";
export type FlagSeverity = "low" | "medium" | "high" | "critical";
export type InterestType = "simple";

export interface User {
  id: string;
  mobile_number: string;
  email: string | null;
  role: UserRole;
  status: "active" | "suspended" | "blocked";
  created_at: string;
}

export interface Borrower {
  id: string;
  user_id: string;
  omang_number: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: "male" | "female";
  marital_status: MaritalStatus;
  address: string;
  city: string;
  district: string;
  employer_name: string | null;
  employer_phone: string | null;
  employment_start_date: string | null;
  net_monthly_salary: bigint;
  borrower_tier: BorrowerTier;
  created_at: string;
}

export interface KycProfile {
  id: string;
  borrower_id: string;
  verification_status: KycStatus;
  ocr_score: number | null;
  liveness_score: number | null;
  selfie_match_score: number | null;
  sanctions_result: string | null;
  verified_at: string | null;
  reviewer_id: string | null;
  review_notes: string | null;
}

export interface Document {
  id: string;
  borrower_id: string;
  document_type: DocumentType;
  file_key: string;
  file_hash: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
  retention_until: string;
}

export interface LoanProduct {
  id: string;
  name: string;
  code: string;
  min_amount: bigint;
  max_amount: bigint;
  min_term_days: number;
  max_term_days: number;
  interest_rate_percent: number;
  origination_fee: bigint;
  interest_type: InterestType;
  penalty_rate_percent: number;
  eligible_segments: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

export interface LoanApplication {
  id: string;
  borrower_id: string;
  product_id: string;
  requested_amount: bigint;
  approved_amount: bigint | null;
  term_days: number;
  status: ApplicationStatus;
  risk_score: number | null;
  decision_type: "auto" | "manual" | null;
  decision_reason: string | null;
  decline_reason_code: string | null;
  reviewed_by: string | null;
  submitted_at: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface Loan {
  id: string;
  application_id: string;
  borrower_id: string;
  product_id: string;
  reference_number: string;
  principal_amount: bigint;
  interest_amount: bigint;
  origination_fee: bigint;
  total_repayable: bigint;
  interest_rate_percent: number;
  term_days: number;
  disbursement_date: string | null;
  maturity_date: string;
  status: LoanStatus;
  outstanding_principal: bigint;
  outstanding_interest: bigint;
  outstanding_penalties: bigint;
  total_paid: bigint;
  days_overdue: number;
  cooling_off_expires_at: string;
  closed_at: string | null;
  created_at: string;
}

export interface RepaymentSchedule {
  id: string;
  loan_id: string;
  instalment_number: number;
  due_date: string;
  principal_component: bigint;
  interest_component: bigint;
  total_due: bigint;
  status: ScheduleStatus;
  paid_amount: bigint;
  paid_at: string | null;
}

export interface Repayment {
  id: string;
  loan_id: string;
  schedule_id: string | null;
  amount: bigint;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  applied_to_principal: bigint;
  applied_to_interest: bigint;
  applied_to_penalties: bigint;
  status: PaymentStatus;
  received_at: string;
}

export interface CollectionsCase {
  id: string;
  loan_id: string;
  borrower_id: string;
  assigned_to: string | null;
  stage: CollectionsStage;
  actions_taken: Record<string, unknown>[];
  status: "open" | "closed";
  resolution: string | null;
  next_action_date: string | null;
}

export interface AuditLog {
  id: number;
  actor_id: string | null;
  actor_type: "user" | "system" | "admin";
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
