-- ============================================================
-- Typo Cash Solutions - Complete Database Schema
-- All money stored as BIGINT in thebe (100 thebe = 1 Pula)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('borrower', 'admin');
CREATE TYPE borrower_tier AS ENUM ('new', 'bronze', 'silver', 'gold');
CREATE TYPE marital_status AS ENUM ('single', 'married', 'divorced', 'widowed');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected', 'expired');
CREATE TYPE document_type AS ENUM (
  'omang_front', 'omang_back', 'selfie', 'payslip',
  'bank_statement', 'proof_of_residence', 'employment_letter'
);
CREATE TYPE loan_status AS ENUM (
  'draft', 'approved', 'cooling_off', 'active', 'overdue',
  'collections', 'restructured', 'closed', 'written_off', 'cancelled'
);
CREATE TYPE application_status AS ENUM (
  'draft', 'submitted', 'under_review', 'approved',
  'declined', 'expired', 'cancelled'
);
CREATE TYPE payment_method AS ENUM ('eft', 'debit_order', 'mobile_money', 'card', 'cash');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'reversed');
CREATE TYPE payment_provider AS ENUM ('paym8', 'orange_money', 'mascom_myzaka', 'manual');
CREATE TYPE mandate_type AS ENUM ('debit_order', 'stop_order');
CREATE TYPE schedule_status AS ENUM ('pending', 'paid', 'partial', 'overdue', 'waived');
CREATE TYPE collections_stage AS ENUM ('early', 'mid', 'late', 'legal', 'write_off');
CREATE TYPE dispute_category AS ENUM (
  'billing_error', 'unauthorized_debit', 'incorrect_balance',
  'fee_dispute', 'service_complaint', 'other'
);
CREATE TYPE dispute_status AS ENUM ('open', 'investigating', 'resolved', 'escalated', 'closed');
CREATE TYPE notification_channel AS ENUM ('sms', 'email', 'push', 'whatsapp');
CREATE TYPE admin_role AS ENUM (
  'super_admin', 'manager', 'credit_officer',
  'collections_agent', 'kyc_reviewer', 'support'
);
CREATE TYPE flag_type AS ENUM ('aml', 'fraud', 'compliance', 'affordability', 'duplicate', 'sanctions');
CREATE TYPE flag_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE interest_type AS ENUM ('simple');

-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number VARCHAR(15) NOT NULL UNIQUE,
  email VARCHAR(255),
  role user_role NOT NULL DEFAULT 'borrower',
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- 2. BORROWERS
-- ============================================================

CREATE TABLE borrowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  omang_number VARCHAR(9) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  marital_status marital_status,
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  employer_name VARCHAR(200),
  employer_phone VARCHAR(15),
  employment_start_date DATE,
  net_monthly_salary BIGINT NOT NULL DEFAULT 0,
  borrower_tier borrower_tier NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_borrowers_user ON borrowers(user_id);
CREATE INDEX idx_borrowers_omang ON borrowers(omang_number);

-- ============================================================
-- 3. KYC PROFILES
-- ============================================================

CREATE TABLE kyc_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE RESTRICT,
  verification_status kyc_status NOT NULL DEFAULT 'pending',
  ocr_score DECIMAL(5,2),
  liveness_score DECIMAL(5,2),
  selfie_match_score DECIMAL(5,2),
  sanctions_result TEXT,
  verified_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES users(id),
  review_notes TEXT
);

CREATE UNIQUE INDEX idx_kyc_borrower ON kyc_profiles(borrower_id);

-- ============================================================
-- 4. DOCUMENTS
-- ============================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE RESTRICT,
  document_type document_type NOT NULL,
  file_key TEXT NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  retention_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '6 years')
);

CREATE INDEX idx_documents_borrower ON documents(borrower_id);

-- ============================================================
-- 5. LOAN PRODUCTS
-- ============================================================

CREATE TABLE loan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  min_amount BIGINT NOT NULL,
  max_amount BIGINT NOT NULL,
  min_term_days INTEGER NOT NULL,
  max_term_days INTEGER NOT NULL,
  interest_rate_percent DECIMAL(5,2) NOT NULL,
  origination_fee BIGINT NOT NULL DEFAULT 0,
  interest_type interest_type NOT NULL DEFAULT 'simple'
    CHECK (interest_type = 'simple'),
  penalty_rate_percent DECIMAL(5,2) NOT NULL DEFAULT 5.0
    CHECK (penalty_rate_percent <= 5.0),
  eligible_segments JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. LOAN APPLICATIONS
-- ============================================================

CREATE TABLE loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES loan_products(id),
  requested_amount BIGINT NOT NULL,
  approved_amount BIGINT,
  term_days INTEGER NOT NULL,
  status application_status NOT NULL DEFAULT 'draft',
  risk_score DECIMAL(5,2),
  decision_type VARCHAR(10) CHECK (decision_type IN ('auto', 'manual')),
  decision_reason TEXT,
  decline_reason_code VARCHAR(50),
  reviewed_by UUID REFERENCES users(id),
  submitted_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_applications_borrower ON loan_applications(borrower_id);
CREATE INDEX idx_applications_status ON loan_applications(status);

-- ============================================================
-- 7. LOANS
-- ============================================================

CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications(id),
  borrower_id UUID NOT NULL REFERENCES borrowers(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES loan_products(id),
  reference_number VARCHAR(20) NOT NULL UNIQUE,
  principal_amount BIGINT NOT NULL,
  interest_amount BIGINT NOT NULL
    CHECK (interest_amount <= principal_amount),
  origination_fee BIGINT NOT NULL DEFAULT 0,
  total_repayable BIGINT NOT NULL,
  interest_rate_percent DECIMAL(5,2) NOT NULL,
  term_days INTEGER NOT NULL,
  disbursement_date DATE,
  maturity_date DATE NOT NULL,
  status loan_status NOT NULL DEFAULT 'draft',
  outstanding_principal BIGINT NOT NULL,
  outstanding_interest BIGINT NOT NULL,
  outstanding_penalties BIGINT NOT NULL DEFAULT 0,
  total_paid BIGINT NOT NULL DEFAULT 0,
  days_overdue INTEGER NOT NULL DEFAULT 0,
  cooling_off_expires_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_reference ON loans(reference_number);

-- ============================================================
-- 8. REPAYMENT SCHEDULES
-- ============================================================

CREATE TABLE repayment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
  instalment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  principal_component BIGINT NOT NULL,
  interest_component BIGINT NOT NULL,
  total_due BIGINT NOT NULL,
  status schedule_status NOT NULL DEFAULT 'pending',
  paid_amount BIGINT NOT NULL DEFAULT 0,
  paid_at TIMESTAMPTZ,
  UNIQUE(loan_id, instalment_number)
);

CREATE INDEX idx_schedules_loan ON repayment_schedules(loan_id);
CREATE INDEX idx_schedules_due ON repayment_schedules(due_date);

-- ============================================================
-- 9. REPAYMENTS
-- ============================================================

CREATE TABLE repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
  schedule_id UUID REFERENCES repayment_schedules(id),
  amount BIGINT NOT NULL CHECK (amount > 0),
  payment_method payment_method NOT NULL,
  payment_reference VARCHAR(100),
  applied_to_principal BIGINT NOT NULL DEFAULT 0,
  applied_to_interest BIGINT NOT NULL DEFAULT 0,
  applied_to_penalties BIGINT NOT NULL DEFAULT 0,
  status payment_status NOT NULL DEFAULT 'pending',
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_repayments_loan ON repayments(loan_id);

-- ============================================================
-- 10. PAYMENT ATTEMPTS
-- ============================================================

CREATE TABLE payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id),
  amount BIGINT NOT NULL,
  payment_method payment_method NOT NULL,
  provider payment_provider NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  retry_number INTEGER NOT NULL DEFAULT 0,
  idempotency_key VARCHAR(100) NOT NULL UNIQUE,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- 11. MANDATES
-- ============================================================

CREATE TABLE mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id),
  loan_id UUID NOT NULL REFERENCES loans(id),
  mandate_type mandate_type NOT NULL,
  provider payment_provider NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
  max_amount BIGINT NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
  next_collection_date DATE
);

-- ============================================================
-- 12. BANK ACCOUNTS
-- ============================================================

CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id),
  bank_name VARCHAR(100) NOT NULL,
  branch_code VARCHAR(20) NOT NULL,
  account_number TEXT NOT NULL,
  account_holder_name VARCHAR(200) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('savings', 'current', 'cheque')),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_bank_accounts_borrower ON bank_accounts(borrower_id);

-- ============================================================
-- 13. MOBILE WALLETS
-- ============================================================

CREATE TABLE mobile_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id),
  provider VARCHAR(50) NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- 14. CREDIT CHECKS
-- ============================================================

CREATE TABLE credit_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id),
  application_id UUID REFERENCES loan_applications(id),
  bureau VARCHAR(50) NOT NULL,
  credit_score INTEGER,
  default_count INTEGER NOT NULL DEFAULT 0,
  total_exposure BIGINT NOT NULL DEFAULT 0,
  raw_response TEXT,
  consent_captured_at TIMESTAMPTZ NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 15. AFFORDABILITY ASSESSMENTS
-- ============================================================

CREATE TABLE affordability_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications(id),
  borrower_id UUID NOT NULL REFERENCES borrowers(id),
  gross_income BIGINT NOT NULL,
  net_income BIGINT NOT NULL,
  existing_obligations BIGINT NOT NULL DEFAULT 0,
  disposable_income BIGINT NOT NULL,
  max_affordable_instalment BIGINT NOT NULL,
  debt_to_income_ratio DECIMAL(5,4) NOT NULL,
  assessment_result VARCHAR(20) NOT NULL
    CHECK (assessment_result IN ('pass', 'fail', 'marginal'))
);

-- ============================================================
-- 16. RISK SCORES
-- ============================================================

CREATE TABLE risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications(id),
  credit_component DECIMAL(5,2) NOT NULL DEFAULT 0,
  affordability_component DECIMAL(5,2) NOT NULL DEFAULT 0,
  employment_component DECIMAL(5,2) NOT NULL DEFAULT 0,
  history_component DECIMAL(5,2) NOT NULL DEFAULT 0,
  fraud_component DECIMAL(5,2) NOT NULL DEFAULT 0,
  composite_score DECIMAL(5,2) NOT NULL,
  risk_band VARCHAR(20) NOT NULL
    CHECK (risk_band IN ('low', 'medium', 'high', 'very_high')),
  decision VARCHAR(20) NOT NULL
    CHECK (decision IN ('auto_approve', 'manual_review', 'auto_decline'))
);

-- ============================================================
-- 17. DISBURSEMENTS
-- ============================================================

CREATE TABLE disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id),
  amount BIGINT NOT NULL,
  method payment_method NOT NULL,
  provider payment_provider NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- 18. COLLECTIONS CASES
-- ============================================================

CREATE TABLE collections_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id),
  borrower_id UUID NOT NULL REFERENCES borrowers(id),
  assigned_to UUID REFERENCES users(id),
  stage collections_stage NOT NULL DEFAULT 'early',
  actions_taken JSONB NOT NULL DEFAULT '[]'::JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed')),
  resolution TEXT,
  next_action_date DATE
);

CREATE INDEX idx_collections_loan ON collections_cases(loan_id);
CREATE INDEX idx_collections_status ON collections_cases(status);

-- ============================================================
-- 19. PENALTIES
-- ============================================================

CREATE TABLE penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id),
  amount BIGINT NOT NULL,
  rate_applied DECIMAL(5,2) NOT NULL,
  outstanding_principal_at_time BIGINT NOT NULL,
  cumulative_penalties_after BIGINT NOT NULL
    CHECK (cumulative_penalties_after <= outstanding_principal_at_time),
  cap_reached BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  waived BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- 20. DISPUTES
-- ============================================================

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id),
  borrower_id UUID NOT NULL REFERENCES borrowers(id),
  category dispute_category NOT NULL,
  description TEXT NOT NULL,
  disputed_amount BIGINT,
  status dispute_status NOT NULL DEFAULT 'open',
  collections_paused BOOLEAN NOT NULL DEFAULT false,
  sla_response_due TIMESTAMPTZ,
  sla_resolution_due TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- 21. NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID REFERENCES borrowers(id),
  loan_id UUID REFERENCES loans(id),
  channel notification_channel NOT NULL,
  template_code VARCHAR(50) NOT NULL,
  recipient VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ
);

-- ============================================================
-- 22. AUDIT LOGS (INSERT-ONLY)
-- ============================================================

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID,
  actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('user', 'system', 'admin')),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Prevent UPDATE/DELETE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable - updates and deletes are not permitted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_immutable
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- ============================================================
-- 23. ADMIN USERS
-- ============================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role admin_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  permissions JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE UNIQUE INDEX idx_admin_user ON admin_users(user_id);

-- ============================================================
-- 24. COMPLIANCE FLAGS
-- ============================================================

CREATE TABLE compliance_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  flag_type flag_type NOT NULL,
  severity flag_severity NOT NULL,
  description TEXT NOT NULL,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_flags_entity ON compliance_flags(entity_type, entity_id);

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Simple interest calculation: principal × (rate/100) × (days/365)
CREATE OR REPLACE FUNCTION calculate_simple_interest(
  p_principal BIGINT,
  p_rate_percent DECIMAL,
  p_term_days INTEGER
) RETURNS BIGINT AS $$
BEGIN
  RETURN ROUND(p_principal * p_rate_percent * p_term_days / (100.0 * 365));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Penalty calculation with THREE hard caps
CREATE OR REPLACE FUNCTION calculate_penalty(
  p_outstanding_principal BIGINT,
  p_original_principal BIGINT,
  p_cumulative_interest BIGINT,
  p_cumulative_penalties BIGINT,
  p_penalty_rate DECIMAL DEFAULT 5.0
) RETURNS BIGINT AS $$
DECLARE
  v_cap1 BIGINT; -- 5% of outstanding principal per month
  v_cap2 BIGINT; -- cumulative penalties <= outstanding principal
  v_cap3 BIGINT; -- in duplum: interest + penalties <= original principal
  v_penalty BIGINT;
BEGIN
  -- Cap 1: max 5% of outstanding principal
  v_cap1 := ROUND(p_outstanding_principal * LEAST(p_penalty_rate, 5.0) / 100.0);

  -- Cap 2: cumulative penalties must not exceed outstanding principal
  v_cap2 := GREATEST(0, p_outstanding_principal - p_cumulative_penalties);

  -- Cap 3: in duplum - (interest + penalties) must not exceed original principal
  v_cap3 := GREATEST(0, p_original_principal - p_cumulative_interest - p_cumulative_penalties);

  -- Return the minimum of all three caps
  v_penalty := LEAST(v_cap1, v_cap2, v_cap3);

  RETURN GREATEST(0, v_penalty);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Affordability check: instalment <= 30% disposable, DTI <= 60%
CREATE OR REPLACE FUNCTION check_affordability(
  p_net_income BIGINT,
  p_existing_obligations BIGINT,
  p_proposed_instalment BIGINT
) RETURNS TABLE(
  disposable_income BIGINT,
  max_affordable_instalment BIGINT,
  debt_to_income DECIMAL,
  result VARCHAR
) AS $$
DECLARE
  v_disposable BIGINT;
  v_max_instalment BIGINT;
  v_dti DECIMAL;
  v_result VARCHAR;
BEGIN
  v_disposable := p_net_income - p_existing_obligations;
  v_max_instalment := ROUND(v_disposable * 0.30);
  v_dti := CASE WHEN p_net_income > 0
    THEN (p_existing_obligations + p_proposed_instalment)::DECIMAL / p_net_income
    ELSE 1.0 END;

  IF p_proposed_instalment <= v_max_instalment AND v_dti <= 0.60 THEN
    v_result := 'pass';
  ELSIF p_proposed_instalment <= ROUND(v_disposable * 0.35) AND v_dti <= 0.65 THEN
    v_result := 'marginal';
  ELSE
    v_result := 'fail';
  END IF;

  RETURN QUERY SELECT v_disposable, v_max_instalment, v_dti, v_result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Reference number generator: TC-YYYYMM-XXXXX
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS VARCHAR AS $$
DECLARE
  v_seq INTEGER;
  v_prefix VARCHAR;
BEGIN
  v_prefix := 'TC-' || to_char(now(), 'YYYYMM') || '-';
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference_number FROM 11) AS INTEGER)
  ), 0) + 1
  INTO v_seq
  FROM loans
  WHERE reference_number LIKE v_prefix || '%';

  RETURN v_prefix || LPAD(v_seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Loan status transition validation
CREATE OR REPLACE FUNCTION check_loan_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Valid transitions
  IF NOT (
    (OLD.status = 'draft' AND NEW.status = 'approved') OR
    (OLD.status = 'approved' AND NEW.status = 'cooling_off') OR
    (OLD.status = 'cooling_off' AND NEW.status IN ('active', 'cancelled')) OR
    (OLD.status = 'active' AND NEW.status IN ('closed', 'overdue')) OR
    (OLD.status = 'overdue' AND NEW.status IN ('active', 'collections', 'closed', 'restructured')) OR
    (OLD.status = 'collections' AND NEW.status IN ('closed', 'written_off', 'restructured'))
  ) THEN
    RAISE EXCEPTION 'Invalid loan status transition: % → %', OLD.status, NEW.status;
  END IF;

  -- Cooling-off cancellation: no penalty
  IF OLD.status = 'cooling_off' AND NEW.status = 'cancelled' THEN
    NEW.closed_at := now();
  END IF;

  -- Closed: record time
  IF NEW.status = 'closed' THEN
    NEW.closed_at := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_loan_status_transition
  BEFORE UPDATE ON loans
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION check_loan_transition();

-- Interest type enforcement
CREATE OR REPLACE FUNCTION enforce_simple_interest()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interest_type != 'simple' THEN
    RAISE EXCEPTION 'Only simple interest is permitted by regulation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_simple_interest
  BEFORE INSERT OR UPDATE ON loan_products
  FOR EACH ROW EXECUTE FUNCTION enforce_simple_interest();

-- Penalty cap enforcement
CREATE OR REPLACE FUNCTION enforce_penalty_caps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cumulative_penalties_after > NEW.outstanding_principal_at_time THEN
    RAISE EXCEPTION 'Cumulative penalties (%) exceed outstanding principal (%)',
      NEW.cumulative_penalties_after, NEW.outstanding_principal_at_time;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_penalty_caps
  BEFORE INSERT ON penalties
  FOR EACH ROW EXECUTE FUNCTION enforce_penalty_caps();

-- Cooling-off enforcement: block disbursement during cooling-off
CREATE OR REPLACE FUNCTION enforce_cooling_off()
RETURNS TRIGGER AS $$
DECLARE
  v_loan RECORD;
BEGIN
  SELECT status, cooling_off_expires_at INTO v_loan FROM loans WHERE id = NEW.loan_id;

  IF v_loan.status = 'cooling_off' THEN
    RAISE EXCEPTION 'Cannot disburse during cooling-off period (expires %)',
      v_loan.cooling_off_expires_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_cooling_off
  BEFORE INSERT ON disbursements
  FOR EACH ROW EXECUTE FUNCTION enforce_cooling_off();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (actor_id, actor_type, action, entity_type, entity_id, new_value)
    VALUES (
      COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
      COALESCE(current_setting('app.current_user_type', true), 'system'),
      'create',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (actor_id, actor_type, action, entity_type, entity_id, old_value, new_value)
    VALUES (
      COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
      COALESCE(current_setting('app.current_user_type', true), 'system'),
      'update',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (actor_id, actor_type, action, entity_type, entity_id, old_value)
    VALUES (
      COALESCE(current_setting('app.current_user_id', true)::UUID, NULL),
      COALESCE(current_setting('app.current_user_type', true), 'system'),
      'delete',
      TG_TABLE_NAME,
      OLD.id::TEXT,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to all financial tables
CREATE TRIGGER trg_audit_loans AFTER INSERT OR UPDATE OR DELETE ON loans FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER trg_audit_repayments AFTER INSERT OR UPDATE OR DELETE ON repayments FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER trg_audit_disbursements AFTER INSERT OR UPDATE OR DELETE ON disbursements FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER trg_audit_penalties AFTER INSERT OR UPDATE OR DELETE ON penalties FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER trg_audit_loan_applications AFTER INSERT OR UPDATE OR DELETE ON loan_applications FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER trg_audit_borrowers AFTER INSERT OR UPDATE ON borrowers FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER trg_audit_mandates AFTER INSERT OR UPDATE ON mandates FOR EACH ROW EXECUTE FUNCTION log_audit();
CREATE TRIGGER trg_audit_disputes AFTER INSERT OR UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Borrower sees own data only
CREATE POLICY borrower_own_data ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY borrower_own_profile ON borrowers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY borrower_own_kyc ON kyc_profiles
  FOR SELECT USING (borrower_id IN (SELECT id FROM borrowers WHERE user_id = auth.uid()));

CREATE POLICY borrower_own_docs ON documents
  FOR ALL USING (borrower_id IN (SELECT id FROM borrowers WHERE user_id = auth.uid()));

CREATE POLICY borrower_own_loans ON loans
  FOR SELECT USING (borrower_id IN (SELECT id FROM borrowers WHERE user_id = auth.uid()));

CREATE POLICY borrower_own_applications ON loan_applications
  FOR ALL USING (borrower_id IN (SELECT id FROM borrowers WHERE user_id = auth.uid()));

CREATE POLICY borrower_own_schedules ON repayment_schedules
  FOR SELECT USING (loan_id IN (
    SELECT id FROM loans WHERE borrower_id IN (
      SELECT id FROM borrowers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY borrower_own_repayments ON repayments
  FOR SELECT USING (loan_id IN (
    SELECT id FROM loans WHERE borrower_id IN (
      SELECT id FROM borrowers WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY borrower_own_bank_accounts ON bank_accounts
  FOR ALL USING (borrower_id IN (SELECT id FROM borrowers WHERE user_id = auth.uid()));

CREATE POLICY borrower_own_wallets ON mobile_wallets
  FOR ALL USING (borrower_id IN (SELECT id FROM borrowers WHERE user_id = auth.uid()));

CREATE POLICY borrower_own_notifications ON notifications
  FOR SELECT USING (borrower_id IN (SELECT id FROM borrowers WHERE user_id = auth.uid()));

CREATE POLICY borrower_own_disputes ON disputes
  FOR ALL USING (borrower_id IN (SELECT id FROM borrowers WHERE user_id = auth.uid()));

-- Admin access: all data based on role
CREATE POLICY admin_all_users ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true)
  );

CREATE POLICY admin_all_borrowers ON borrowers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true)
  );

CREATE POLICY admin_all_loans ON loans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true)
  );

CREATE POLICY admin_all_applications ON loan_applications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true)
  );

-- Public read for loan products
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_products ON loan_products
  FOR SELECT USING (true);

CREATE POLICY admin_manage_products ON loan_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid() AND au.is_active = true)
  );

-- ============================================================
-- SEED DATA
-- ============================================================

-- 4 Loan Products
INSERT INTO loan_products (name, code, min_amount, max_amount, min_term_days, max_term_days, interest_rate_percent, origination_fee, penalty_rate_percent) VALUES
  ('Quick Cash',      'QC', 50000,  300000, 14, 30,  12.0, 2500,  5.0),
  ('Emergency Loan',  'EM', 50000,  500000, 30, 30,  15.0, 5000,  5.0),
  ('Instalment Loan', 'IN', 100000, 700000, 60, 90,  18.0, 7500,  5.0),
  ('Salary-Backed',   'SB', 200000, 700000, 90, 90,  15.0, 5000,  5.0);

-- Super Admin
INSERT INTO users (id, mobile_number, email, role, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', '+26771000001', 'admin@typocash.co.bw', 'admin', 'active');

INSERT INTO admin_users (user_id, first_name, last_name, role, permissions) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'System', 'Admin', 'super_admin', '{"all": true}'::JSONB);

-- 5 Test Borrowers
INSERT INTO users (id, mobile_number, role, status) VALUES
  ('b0000000-0000-0000-0000-000000000001', '+26772000001', 'borrower', 'active'),
  ('b0000000-0000-0000-0000-000000000002', '+26772000002', 'borrower', 'active'),
  ('b0000000-0000-0000-0000-000000000003', '+26772000003', 'borrower', 'active'),
  ('b0000000-0000-0000-0000-000000000004', '+26772000004', 'borrower', 'active'),
  ('b0000000-0000-0000-0000-000000000005', '+26772000005', 'borrower', 'active');

INSERT INTO borrowers (user_id, omang_number, first_name, last_name, dob, gender, marital_status, address, city, district, employer_name, net_monthly_salary, borrower_tier) VALUES
  ('b0000000-0000-0000-0000-000000000001', '123456789', 'Thabo',   'Modise',   '1990-05-15', 'male',   'single',  'Plot 123 Extension 12',  'Gaborone',    'South-East',  'Debswana',        850000, 'silver'),
  ('b0000000-0000-0000-0000-000000000002', '234567890', 'Kefilwe', 'Motswana', '1988-11-22', 'female', 'married', 'House 45 Block 6',       'Francistown', 'North-East',  'BTC',             620000, 'bronze'),
  ('b0000000-0000-0000-0000-000000000003', '345678901', 'Mpho',    'Kgosi',    '1995-03-08', 'male',   'single',  'Plot 789 Phase 2',       'Maun',        'North-West',  'Wilderness Safaris', 480000, 'new'),
  ('b0000000-0000-0000-0000-000000000004', '456789012', 'Naledi',  'Tau',      '1992-07-19', 'female', 'divorced','Unit 3 Fairgrounds',     'Gaborone',    'South-East',  'FNB Botswana',    950000, 'gold'),
  ('b0000000-0000-0000-0000-000000000005', '567890123', 'Kagiso',  'Ratsie',   '1997-01-30', 'male',   'single',  'P.O. Box 999',           'Lobatse',     'South-East',  'BMC',             550000, 'new');

-- 3 Test Loans (using subquery for product IDs)
INSERT INTO loan_applications (id, borrower_id, product_id, requested_amount, approved_amount, term_days, status, risk_score, decision_type, submitted_at, decided_at) VALUES
  ('c0000000-0000-0000-0000-000000000001',
   (SELECT id FROM borrowers WHERE omang_number = '123456789'),
   (SELECT id FROM loan_products WHERE code = 'QC'),
   200000, 200000, 30, 'approved', 72.5, 'auto', now() - INTERVAL '10 days', now() - INTERVAL '10 days'),
  ('c0000000-0000-0000-0000-000000000002',
   (SELECT id FROM borrowers WHERE omang_number = '234567890'),
   (SELECT id FROM loan_products WHERE code = 'IN'),
   500000, 500000, 90, 'approved', 68.0, 'manual', now() - INTERVAL '30 days', now() - INTERVAL '29 days'),
  ('c0000000-0000-0000-0000-000000000003',
   (SELECT id FROM borrowers WHERE omang_number = '456789012'),
   (SELECT id FROM loan_products WHERE code = 'SB'),
   700000, 700000, 90, 'approved', 85.0, 'auto', now() - INTERVAL '60 days', now() - INTERVAL '59 days');

INSERT INTO loans (application_id, borrower_id, product_id, reference_number, principal_amount, interest_amount, origination_fee, total_repayable, interest_rate_percent, term_days, maturity_date, status, outstanding_principal, outstanding_interest, outstanding_penalties, total_paid, days_overdue, cooling_off_expires_at) VALUES
  ('c0000000-0000-0000-0000-000000000001',
   (SELECT id FROM borrowers WHERE omang_number = '123456789'),
   (SELECT id FROM loan_products WHERE code = 'QC'),
   'TC-202603-00001', 200000, 1973, 2500, 204473, 12.0, 30,
   CURRENT_DATE + 20, 'active', 200000, 1973, 0, 0, 0, now() - INTERVAL '8 days'),
  ('c0000000-0000-0000-0000-000000000002',
   (SELECT id FROM borrowers WHERE omang_number = '234567890'),
   (SELECT id FROM loan_products WHERE code = 'IN'),
   'TC-202603-00002', 500000, 22192, 7500, 529692, 18.0, 90,
   CURRENT_DATE + 60, 'active', 350000, 15534, 0, 164158, 0, now() - INTERVAL '28 days'),
  ('c0000000-0000-0000-0000-000000000003',
   (SELECT id FROM borrowers WHERE omang_number = '456789012'),
   (SELECT id FROM loan_products WHERE code = 'SB'),
   'TC-202602-00001', 700000, 25890, 5000, 730890, 15.0, 90,
   CURRENT_DATE - 1, 'overdue', 233333, 8630, 11667, 477260, 1, now() - INTERVAL '58 days');
