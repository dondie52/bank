-- ============================================================
-- Demo Seed Data for Typo Cash Solutions
-- Run in Supabase SQL Editor after 00001_schema.sql
-- All amounts in thebe (100 thebe = 1 Pula)
-- ============================================================

-- Disable RLS temporarily for seeding
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE borrowers DISABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE repayment_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE repayments DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE disputes DISABLE ROW LEVEL SECURITY;
ALTER TABLE collections_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE penalties DISABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Clean existing seed data (idempotent)
-- ============================================================
DELETE FROM penalties WHERE loan_id IN (SELECT id FROM loans WHERE reference_number LIKE 'TC-DEMO%');
DELETE FROM collections_cases WHERE loan_id IN (SELECT id FROM loans WHERE reference_number LIKE 'TC-DEMO%');
DELETE FROM repayments WHERE loan_id IN (SELECT id FROM loans WHERE reference_number LIKE 'TC-DEMO%');
DELETE FROM repayment_schedules WHERE loan_id IN (SELECT id FROM loans WHERE reference_number LIKE 'TC-DEMO%');
DELETE FROM disbursements WHERE loan_id IN (SELECT id FROM loans WHERE reference_number LIKE 'TC-DEMO%');
DELETE FROM loans WHERE reference_number LIKE 'TC-DEMO%';
DELETE FROM loan_applications WHERE borrower_id IN (SELECT id FROM borrowers WHERE omang_number IN ('111222333','222333444','333444555','444555666','555666777'));
DELETE FROM notifications WHERE borrower_id IN (SELECT id FROM borrowers WHERE omang_number IN ('111222333','222333444','333444555','444555666','555666777'));
DELETE FROM bank_accounts WHERE borrower_id IN (SELECT id FROM borrowers WHERE omang_number IN ('111222333','222333444','333444555','444555666','555666777'));
DELETE FROM kyc_profiles WHERE borrower_id IN (SELECT id FROM borrowers WHERE omang_number IN ('111222333','222333444','333444555','444555666','555666777'));
DELETE FROM borrowers WHERE omang_number IN ('111222333','222333444','333444555','444555666','555666777');
DELETE FROM users WHERE id IN ('d0000001-0000-0000-0000-000000000001','d0000002-0000-0000-0000-000000000002','d0000003-0000-0000-0000-000000000003','d0000004-0000-0000-0000-000000000004','d0000005-0000-0000-0000-000000000005');

-- ============================================================
-- 5 Demo Borrower Users
-- ============================================================
INSERT INTO users (id, mobile_number, email, role, status) VALUES
  ('d0000001-0000-0000-0000-000000000001', '+26774100001', 'thabo.molefe@demo.bw', 'borrower', 'active'),
  ('d0000002-0000-0000-0000-000000000002', '+26774100002', 'kefilwe.modise@demo.bw', 'borrower', 'active'),
  ('d0000003-0000-0000-0000-000000000003', '+26774100003', 'mpho.kgosana@demo.bw', 'borrower', 'active'),
  ('d0000004-0000-0000-0000-000000000004', '+26774100004', 'boitumelo.tau@demo.bw', 'borrower', 'active'),
  ('d0000005-0000-0000-0000-000000000005', '+26774100005', 'kagiso.dube@demo.bw', 'borrower', 'active');

-- ============================================================
-- 5 Demo Borrower Profiles
-- ============================================================
INSERT INTO borrowers (id, user_id, omang_number, first_name, last_name, dob, gender, marital_status, address, city, district, employer_name, employer_phone, employment_start_date, net_monthly_salary, borrower_tier) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', '111222333', 'Thabo', 'Molefe', '1991-03-15', 'male', 'single', 'Plot 456 Extension 9', 'Gaborone', 'South-East', 'Debswana Diamond Company', '+26731600000', '2018-06-01', 920000, 'silver'),
  ('e0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', '222333444', 'Kefilwe', 'Modise', '1989-07-22', 'female', 'married', 'House 78 Block 3', 'Francistown', 'North-East', 'Botswana Telecommunications Corp', '+26736100000', '2016-01-15', 680000, 'bronze'),
  ('e0000003-0000-0000-0000-000000000003', 'd0000003-0000-0000-0000-000000000003', '333444555', 'Mpho', 'Kgosana', '1996-11-08', 'male', 'single', 'Plot 12 Matlapana Ward', 'Maun', 'North-West', 'Wilderness Safaris', '+26768600000', '2023-09-01', 450000, 'new'),
  ('e0000004-0000-0000-0000-000000000004', 'd0000004-0000-0000-0000-000000000004', '444555666', 'Boitumelo', 'Tau', '1993-02-19', 'female', 'divorced', 'Unit 5 Fairgrounds Mall', 'Gaborone', 'South-East', 'FNB Botswana', '+26739500000', '2017-04-10', 1050000, 'bronze'),
  ('e0000005-0000-0000-0000-000000000005', 'd0000005-0000-0000-0000-000000000005', '555666777', 'Kagiso', 'Dube', '1994-09-30', 'male', 'married', 'P.O. Box 234 CBD', 'Gaborone', 'South-East', 'Botswana Power Corporation', '+26736000000', '2019-02-01', 780000, 'silver');

-- ============================================================
-- KYC Profiles
-- ============================================================
INSERT INTO kyc_profiles (id, borrower_id, verification_status, ocr_score, liveness_score, selfie_match_score, verified_at) VALUES
  ('f0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'verified', 95.5, 98.2, 96.8, now() - INTERVAL '45 days'),
  ('f0000002-0000-0000-0000-000000000002', 'e0000002-0000-0000-0000-000000000002', 'verified', 92.0, 97.5, 94.1, now() - INTERVAL '60 days'),
  ('f0000003-0000-0000-0000-000000000003', 'e0000003-0000-0000-0000-000000000003', 'pending', 88.0, 91.0, NULL, NULL),
  ('f0000004-0000-0000-0000-000000000004', 'e0000004-0000-0000-0000-000000000004', 'verified', 97.0, 99.1, 98.5, now() - INTERVAL '90 days'),
  ('f0000005-0000-0000-0000-000000000005', 'e0000005-0000-0000-0000-000000000005', 'verified', 94.3, 96.7, 95.2, now() - INTERVAL '30 days');

-- ============================================================
-- Bank Accounts
-- ============================================================
INSERT INTO bank_accounts (borrower_id, bank_name, branch_code, account_number, account_holder_name, account_type, is_primary, verified) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'First National Bank Botswana', '282567', '62345678901', 'THABO MOLEFE', 'savings', true, true),
  ('e0000002-0000-0000-0000-000000000002', 'Standard Chartered Botswana', '602001', '01234567890', 'KEFILWE MODISE', 'current', true, true),
  ('e0000004-0000-0000-0000-000000000004', 'Barclays Bank Botswana', '290267', '91234567890', 'BOITUMELO TAU', 'savings', true, true),
  ('e0000005-0000-0000-0000-000000000005', 'Bank Gaborone', '440067', '78901234567', 'KAGISO DUBE', 'current', true, true);

-- ============================================================
-- Loan Applications
-- ============================================================

-- Thabo: Quick Cash P2,000 approved 20 days ago
INSERT INTO loan_applications (id, borrower_id, product_id, requested_amount, approved_amount, term_days, status, risk_score, decision_type, decision_reason, submitted_at, decided_at) VALUES
  ('a1000001-0000-0000-0000-000000000001',
   'e0000001-0000-0000-0000-000000000001',
   (SELECT id FROM loan_products WHERE code = 'QC'),
   200000, 200000, 30, 'approved', 78.5, 'auto', 'Low risk - verified KYC, stable employment',
   now() - INTERVAL '20 days', now() - INTERVAL '20 days');

-- Kefilwe: Emergency P3,500 approved 45 days ago (now overdue)
INSERT INTO loan_applications (id, borrower_id, product_id, requested_amount, approved_amount, term_days, status, risk_score, decision_type, decision_reason, submitted_at, decided_at) VALUES
  ('a1000002-0000-0000-0000-000000000002',
   'e0000002-0000-0000-0000-000000000002',
   (SELECT id FROM loan_products WHERE code = 'EM'),
   350000, 350000, 30, 'approved', 65.0, 'manual', 'Moderate risk - approved after manual review',
   now() - INTERVAL '45 days', now() - INTERVAL '44 days');

-- Boitumelo: Quick Cash P1,500 approved 70 days ago (closed/paid)
INSERT INTO loan_applications (id, borrower_id, product_id, requested_amount, approved_amount, term_days, status, risk_score, decision_type, decision_reason, submitted_at, decided_at) VALUES
  ('a1000003-0000-0000-0000-000000000003',
   'e0000004-0000-0000-0000-000000000004',
   (SELECT id FROM loan_products WHERE code = 'QC'),
   150000, 150000, 30, 'approved', 88.0, 'auto', 'Low risk - excellent profile',
   now() - INTERVAL '70 days', now() - INTERVAL '70 days');

-- Kagiso: Instalment P5,000 approved 40 days ago (active, current)
INSERT INTO loan_applications (id, borrower_id, product_id, requested_amount, approved_amount, term_days, status, risk_score, decision_type, decision_reason, submitted_at, decided_at) VALUES
  ('a1000004-0000-0000-0000-000000000004',
   'e0000005-0000-0000-0000-000000000005',
   (SELECT id FROM loan_products WHERE code = 'IN'),
   500000, 500000, 90, 'approved', 72.0, 'auto', 'Medium risk - stable BPC employment',
   now() - INTERVAL '40 days', now() - INTERVAL '40 days');

-- Kagiso: Quick Cash P1,000 approved 120 days ago (closed)
INSERT INTO loan_applications (id, borrower_id, product_id, requested_amount, approved_amount, term_days, status, risk_score, decision_type, decision_reason, submitted_at, decided_at) VALUES
  ('a1000005-0000-0000-0000-000000000005',
   'e0000005-0000-0000-0000-000000000005',
   (SELECT id FROM loan_products WHERE code = 'QC'),
   100000, 100000, 14, 'approved', 75.0, 'auto', 'Low risk - returning borrower',
   now() - INTERVAL '120 days', now() - INTERVAL '120 days');

-- ============================================================
-- Loans
-- ============================================================

-- Thabo: Active Quick Cash P2,000, 15 days remaining
INSERT INTO loans (id, application_id, borrower_id, product_id, reference_number, principal_amount, interest_amount, origination_fee, total_repayable, interest_rate_percent, term_days, disbursement_date, maturity_date, status, outstanding_principal, outstanding_interest, outstanding_penalties, total_paid, days_overdue, cooling_off_expires_at) VALUES
  ('10000001-0000-0000-0000-000000000001',
   'a1000001-0000-0000-0000-000000000001',
   'e0000001-0000-0000-0000-000000000001',
   (SELECT id FROM loan_products WHERE code = 'QC'),
   'TC-DEMO-00001', 200000, 1973, 2500, 204473, 12.0, 30,
   (CURRENT_DATE - 15)::DATE,
   (CURRENT_DATE + 15)::DATE,
   'active', 200000, 1973, 0, 0, 0,
   now() - INTERVAL '18 days');

-- Kefilwe: Overdue Emergency P3,500, 12 days overdue
INSERT INTO loans (id, application_id, borrower_id, product_id, reference_number, principal_amount, interest_amount, origination_fee, total_repayable, interest_rate_percent, term_days, disbursement_date, maturity_date, status, outstanding_principal, outstanding_interest, outstanding_penalties, total_paid, days_overdue, cooling_off_expires_at) VALUES
  ('10000002-0000-0000-0000-000000000002',
   'a1000002-0000-0000-0000-000000000002',
   'e0000002-0000-0000-0000-000000000002',
   (SELECT id FROM loan_products WHERE code = 'EM'),
   'TC-DEMO-00002', 350000, 4315, 5000, 359315, 15.0, 30,
   (CURRENT_DATE - 42)::DATE,
   (CURRENT_DATE - 12)::DATE,
   'overdue', 350000, 4315, 17500, 0, 12,
   now() - INTERVAL '40 days');

-- Boitumelo: Closed Quick Cash P1,500 (fully paid)
INSERT INTO loans (id, application_id, borrower_id, product_id, reference_number, principal_amount, interest_amount, origination_fee, total_repayable, interest_rate_percent, term_days, disbursement_date, maturity_date, status, outstanding_principal, outstanding_interest, outstanding_penalties, total_paid, days_overdue, cooling_off_expires_at, closed_at) VALUES
  ('10000003-0000-0000-0000-000000000003',
   'a1000003-0000-0000-0000-000000000003',
   'e0000004-0000-0000-0000-000000000004',
   (SELECT id FROM loan_products WHERE code = 'QC'),
   'TC-DEMO-00003', 150000, 1479, 2500, 153979, 12.0, 30,
   (CURRENT_DATE - 68)::DATE,
   (CURRENT_DATE - 38)::DATE,
   'closed', 0, 0, 0, 153979, 0,
   now() - INTERVAL '68 days',
   now() - INTERVAL '35 days');

-- Kagiso: Active Instalment P5,000, 50 days remaining
INSERT INTO loans (id, application_id, borrower_id, product_id, reference_number, principal_amount, interest_amount, origination_fee, total_repayable, interest_rate_percent, term_days, disbursement_date, maturity_date, status, outstanding_principal, outstanding_interest, outstanding_penalties, total_paid, days_overdue, cooling_off_expires_at) VALUES
  ('10000004-0000-0000-0000-000000000004',
   'a1000004-0000-0000-0000-000000000004',
   'e0000005-0000-0000-0000-000000000005',
   (SELECT id FROM loan_products WHERE code = 'IN'),
   'TC-DEMO-00004', 500000, 22192, 7500, 529692, 18.0, 90,
   (CURRENT_DATE - 38)::DATE,
   (CURRENT_DATE + 52)::DATE,
   'active', 333333, 14795, 0, 181564, 0,
   now() - INTERVAL '36 days');

-- Kagiso: Closed Quick Cash P1,000 (fully paid, old)
INSERT INTO loans (id, application_id, borrower_id, product_id, reference_number, principal_amount, interest_amount, origination_fee, total_repayable, interest_rate_percent, term_days, disbursement_date, maturity_date, status, outstanding_principal, outstanding_interest, outstanding_penalties, total_paid, days_overdue, cooling_off_expires_at, closed_at) VALUES
  ('10000005-0000-0000-0000-000000000005',
   'a1000005-0000-0000-0000-000000000005',
   'e0000005-0000-0000-0000-000000000005',
   (SELECT id FROM loan_products WHERE code = 'QC'),
   'TC-DEMO-00005', 100000, 460, 2500, 102960, 12.0, 14,
   (CURRENT_DATE - 118)::DATE,
   (CURRENT_DATE - 104)::DATE,
   'closed', 0, 0, 0, 102960, 0,
   now() - INTERVAL '116 days',
   now() - INTERVAL '102 days');

-- ============================================================
-- Repayment Schedules
-- ============================================================

-- Thabo: 1 instalment due in 15 days
INSERT INTO repayment_schedules (loan_id, instalment_number, due_date, principal_component, interest_component, total_due, status, paid_amount) VALUES
  ('10000001-0000-0000-0000-000000000001', 1, (CURRENT_DATE + 15)::DATE, 200000, 1973, 201973, 'pending', 0);

-- Kefilwe: 1 instalment that was due 12 days ago (overdue)
INSERT INTO repayment_schedules (loan_id, instalment_number, due_date, principal_component, interest_component, total_due, status, paid_amount) VALUES
  ('10000002-0000-0000-0000-000000000002', 1, (CURRENT_DATE - 12)::DATE, 350000, 4315, 354315, 'overdue', 0);

-- Boitumelo: 1 instalment paid in full
INSERT INTO repayment_schedules (loan_id, instalment_number, due_date, principal_component, interest_component, total_due, status, paid_amount, paid_at) VALUES
  ('10000003-0000-0000-0000-000000000003', 1, (CURRENT_DATE - 38)::DATE, 150000, 1479, 151479, 'paid', 151479, now() - INTERVAL '40 days');

-- Kagiso Instalment: 3 instalments over 90 days
INSERT INTO repayment_schedules (loan_id, instalment_number, due_date, principal_component, interest_component, total_due, status, paid_amount, paid_at) VALUES
  ('10000004-0000-0000-0000-000000000004', 1, (CURRENT_DATE - 8)::DATE, 166667, 7397, 174064, 'paid', 174064, now() - INTERVAL '9 days'),
  ('10000004-0000-0000-0000-000000000004', 2, (CURRENT_DATE + 22)::DATE, 166667, 7397, 174064, 'pending', 0, NULL),
  ('10000004-0000-0000-0000-000000000004', 3, (CURRENT_DATE + 52)::DATE, 166666, 7398, 174064, 'pending', 0, NULL);

-- Kagiso old loan: 1 instalment paid
INSERT INTO repayment_schedules (loan_id, instalment_number, due_date, principal_component, interest_component, total_due, status, paid_amount, paid_at) VALUES
  ('10000005-0000-0000-0000-000000000005', 1, (CURRENT_DATE - 104)::DATE, 100000, 460, 100460, 'paid', 100460, now() - INTERVAL '105 days');

-- ============================================================
-- Repayments (payments made)
-- ============================================================

-- Boitumelo: Paid her loan in full
INSERT INTO repayments (loan_id, schedule_id, amount, payment_method, payment_reference, applied_to_principal, applied_to_interest, applied_to_penalties, status, received_at) VALUES
  ('10000003-0000-0000-0000-000000000003',
   (SELECT id FROM repayment_schedules WHERE loan_id = '10000003-0000-0000-0000-000000000003' AND instalment_number = 1),
   153979, 'eft', 'PAY-DEMO-BT-001', 150000, 1479, 0, 'completed', now() - INTERVAL '40 days');

-- Kagiso: Paid first instalment of active loan
INSERT INTO repayments (loan_id, schedule_id, amount, payment_method, payment_reference, applied_to_principal, applied_to_interest, applied_to_penalties, status, received_at) VALUES
  ('10000004-0000-0000-0000-000000000004',
   (SELECT id FROM repayment_schedules WHERE loan_id = '10000004-0000-0000-0000-000000000004' AND instalment_number = 1),
   174064, 'debit_order', 'PAY-DEMO-KD-001', 166667, 7397, 0, 'completed', now() - INTERVAL '9 days');

-- Kagiso: Paid old loan in full
INSERT INTO repayments (loan_id, schedule_id, amount, payment_method, payment_reference, applied_to_principal, applied_to_interest, applied_to_penalties, status, received_at) VALUES
  ('10000005-0000-0000-0000-000000000005',
   (SELECT id FROM repayment_schedules WHERE loan_id = '10000005-0000-0000-0000-000000000005' AND instalment_number = 1),
   102960, 'eft', 'PAY-DEMO-KD-002', 100000, 460, 0, 'completed', now() - INTERVAL '105 days');

-- ============================================================
-- Disbursements
-- ============================================================
INSERT INTO disbursements (loan_id, amount, method, provider, status, initiated_at, completed_at) VALUES
  ('10000001-0000-0000-0000-000000000001', 197500, 'eft', 'paym8', 'completed', now() - INTERVAL '18 days', now() - INTERVAL '18 days'),
  ('10000002-0000-0000-0000-000000000002', 345000, 'eft', 'paym8', 'completed', now() - INTERVAL '42 days', now() - INTERVAL '42 days'),
  ('10000003-0000-0000-0000-000000000003', 147500, 'eft', 'paym8', 'completed', now() - INTERVAL '68 days', now() - INTERVAL '68 days'),
  ('10000004-0000-0000-0000-000000000004', 492500, 'eft', 'paym8', 'completed', now() - INTERVAL '38 days', now() - INTERVAL '38 days'),
  ('10000005-0000-0000-0000-000000000005', 97500, 'eft', 'paym8', 'completed', now() - INTERVAL '118 days', now() - INTERVAL '118 days');

-- ============================================================
-- Penalty for overdue loan (Kefilwe)
-- ============================================================
INSERT INTO penalties (loan_id, amount, rate_applied, outstanding_principal_at_time, cumulative_penalties_after, cap_reached, applied_at, waived) VALUES
  ('10000002-0000-0000-0000-000000000002', 17500, 5.0, 350000, 17500, false, now() - INTERVAL '2 days', false);

-- ============================================================
-- Collections Case (Kefilwe)
-- ============================================================
INSERT INTO collections_cases (loan_id, borrower_id, stage, actions_taken, status, next_action_date) VALUES
  ('10000002-0000-0000-0000-000000000002',
   'e0000002-0000-0000-0000-000000000002',
   'early',
   ('[{"action":"sms_reminder","date":"' || (CURRENT_DATE - 10)::TEXT || '"},{"action":"phone_call","date":"' || (CURRENT_DATE - 5)::TEXT || '","notes":"No answer, left voicemail"}]')::JSONB,
   'open',
   (CURRENT_DATE + 3)::DATE);

-- ============================================================
-- Notifications
-- ============================================================
INSERT INTO notifications (borrower_id, loan_id, channel, template_code, recipient, status, sent_at) VALUES
  -- Thabo: Approval + disbursement
  ('e0000001-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001', 'sms', 'loan_approved', '+26774100001', 'delivered', now() - INTERVAL '20 days'),
  ('e0000001-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001', 'sms', 'funds_disbursed', '+26774100001', 'delivered', now() - INTERVAL '18 days'),
  ('e0000001-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001', 'sms', 'payment_reminder', '+26774100001', 'delivered', now() - INTERVAL '1 day'),
  -- Kefilwe: Approval + overdue notices
  ('e0000002-0000-0000-0000-000000000002', '10000002-0000-0000-0000-000000000002', 'sms', 'loan_approved', '+26774100002', 'delivered', now() - INTERVAL '44 days'),
  ('e0000002-0000-0000-0000-000000000002', '10000002-0000-0000-0000-000000000002', 'sms', 'payment_overdue', '+26774100002', 'delivered', now() - INTERVAL '10 days'),
  ('e0000002-0000-0000-0000-000000000002', '10000002-0000-0000-0000-000000000002', 'sms', 'payment_overdue', '+26774100002', 'delivered', now() - INTERVAL '3 days'),
  -- Boitumelo: Full cycle
  ('e0000004-0000-0000-0000-000000000004', '10000003-0000-0000-0000-000000000003', 'sms', 'loan_approved', '+26774100004', 'delivered', now() - INTERVAL '70 days'),
  ('e0000004-0000-0000-0000-000000000004', '10000003-0000-0000-0000-000000000003', 'sms', 'payment_received', '+26774100004', 'delivered', now() - INTERVAL '40 days'),
  ('e0000004-0000-0000-0000-000000000004', '10000003-0000-0000-0000-000000000003', 'sms', 'loan_closed', '+26774100004', 'delivered', now() - INTERVAL '35 days'),
  -- Kagiso: Active loan notifications
  ('e0000005-0000-0000-0000-000000000005', '10000004-0000-0000-0000-000000000004', 'sms', 'loan_approved', '+26774100005', 'delivered', now() - INTERVAL '40 days'),
  ('e0000005-0000-0000-0000-000000000005', '10000004-0000-0000-0000-000000000004', 'sms', 'payment_received', '+26774100005', 'delivered', now() - INTERVAL '9 days');

-- ============================================================
-- Re-enable RLS
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
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
