"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { useApplication } from "@/hooks/use-applications";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  FileCheck,
  ShieldCheck,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Image,
} from "lucide-react";

/* ---------- radar chart (SVG) ---------- */

function RadarChart({ components }: { components: { label: string; score: number }[] }) {
  const cx = 150;
  const cy = 150;
  const maxR = 110;
  const levels = 5;
  const n = components.length;
  if (n === 0) return null;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const getPoint = (i: number, r: number) => {
    const angle = startAngle + i * angleStep;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLines = Array.from({ length: levels }, (_, li) => {
    const r = ((li + 1) / levels) * maxR;
    const points = Array.from({ length: n }, (_, i) => {
      const p = getPoint(i, r);
      return `${p.x},${p.y}`;
    }).join(" ");
    return <polygon key={li} points={points} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
  });

  const axes = Array.from({ length: n }, (_, i) => {
    const p = getPoint(i, maxR);
    return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />;
  });

  const dataPoints = components.map((c, i) => {
    const r = (c.score / 100) * maxR;
    return getPoint(i, r);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const labels = components.map((c, i) => {
    const p = getPoint(i, maxR + 28);
    return (
      <text
        key={i}
        x={p.x}
        y={p.y}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-slate-600 text-[11px]"
      >
        {c.label}
      </text>
    );
  });

  const dots = dataPoints.map((p, i) => (
    <circle key={i} cx={p.x} cy={p.y} r={3} fill="#0EA5E9" />
  ));

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
      {gridLines}
      {axes}
      <polygon points={dataPolygon} fill="rgba(14,165,233,0.15)" stroke="#0EA5E9" strokeWidth="2" />
      {dots}
      {labels}
    </svg>
  );
}

/* ---------- page ---------- */

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: app, isLoading } = useApplication(id);
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<"" | "approve" | "decline">("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitDecision = async () => {
    if (!decision || !app) return;
    if (decision === "decline" && !reason.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const newStatus = decision === "approve" ? "approved" : "declined";
    await supabase
      .from("loan_applications")
      .update({
        status: newStatus,
        review_notes: reason || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    queryClient.invalidateQueries({ queryKey: ["application", id] });
    queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    setSubmitting(false);
    setDecision("");
    setReason("");
  };

  if (isLoading || !app) {
    return (
      <div className="space-y-6">
        <div>
          <a href="/admin/applications" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </a>
          <h1 className="text-2xl font-bold text-slate-900">Loading...</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const borrower = app.borrowers ?? {};
  const userInfo = borrower.users ?? {};
  const loanProduct = app.loan_products ?? {};
  const creditCheck = Array.isArray(app.credit_checks) ? app.credit_checks[0] : app.credit_checks;
  const affordability = Array.isArray(app.affordability_assessments) ? app.affordability_assessments[0] : app.affordability_assessments;
  const riskScoreData = Array.isArray(app.risk_scores) ? app.risk_scores[0] : app.risk_scores;

  const b = {
    name: `${borrower.first_name ?? ""} ${borrower.last_name ?? ""}`.trim(),
    omang: borrower.omang_number ? `****${borrower.omang_number.slice(-4)}` : "----",
    dob: borrower.dob ?? "--",
    phone: userInfo.mobile_number ?? "--",
    email: userInfo.email ?? "--",
    employer: borrower.employer_name ?? "--",
    monthlySalary: BigInt(borrower.net_monthly_salary || 0),
    address: [borrower.address, borrower.city, borrower.district].filter(Boolean).join(", ") || "--",
  };

  const cc = creditCheck ? {
    score: creditCheck.credit_score ?? 0,
    maxScore: 850,
    activeLoanCount: creditCheck.active_loan_count ?? 0,
    totalExposure: BigInt(creditCheck.total_exposure || 0),
    missedPayments30: creditCheck.missed_payments_30 ?? 0,
    missedPayments60: creditCheck.missed_payments_60 ?? 0,
    missedPayments90: creditCheck.missed_payments_90 ?? 0,
    blacklisted: creditCheck.blacklisted ?? false,
    judgments: creditCheck.judgments ?? 0,
  } : null;

  const af = affordability ? {
    grossIncome: BigInt(affordability.gross_income || 0),
    deductions: BigInt(affordability.deductions || 0),
    netIncome: BigInt(affordability.net_income || 0),
    existingObligations: BigInt(affordability.existing_obligations || 0),
    disposableIncome: BigInt(affordability.disposable_income || 0),
    proposedInstalment: BigInt(affordability.proposed_instalment || 0),
    dtiRatio: affordability.dti_ratio ?? 0,
    instalmentRatio: affordability.instalment_ratio ?? 0,
    passes: affordability.passes ?? false,
  } : null;

  const riskComponents = riskScoreData?.components ?? [];
  const overallRisk = riskScoreData?.overall_score ?? app.risk_score ?? 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <a
          href="/admin/applications"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications
        </a>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Application {app.id.slice(0, 8)}...</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {loanProduct.name ?? "--"} &middot; {app.created_at ? new Date(app.created_at).toISOString().slice(0, 10) : "--"}
            </p>
          </div>
          <StatusBadge status={app.status} className="text-sm px-3 py-1" />
        </div>
      </div>

      {/* Top grid: Borrower + KYC docs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Borrower info */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-900">Borrower Information</h2>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {([
              ["Full Name", b.name],
              ["Omang", b.omang],
              ["Date of Birth", b.dob],
              ["Phone", b.phone],
              ["Email", b.email],
              ["Employer", b.employer],
              ["Monthly Salary", formatMoney(b.monthlySalary)],
              ["Address", b.address],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <dt className="text-slate-500">{label}</dt>
                <dd className={cn("font-medium text-slate-900", label === "Monthly Salary" && "font-mono")}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Loan details */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-900">Loan Request</h2>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Product</dt>
              <dd className="font-medium text-slate-900">{loanProduct.name ?? "--"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Amount Requested</dt>
              <dd className="font-mono font-medium text-slate-900">{formatMoney(BigInt(app.requested_amount || 0))}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Term</dt>
              <dd className="font-medium text-slate-900">{app.requested_term_days ?? "--"} days</dd>
            </div>
            <div>
              <dt className="text-slate-500">Interest Rate</dt>
              <dd className="font-medium text-slate-900">{loanProduct.interest_rate ?? "--"}%</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Middle grid: Credit check + Affordability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit check */}
        {cc && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-slate-900">Credit Check Results</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Credit Score</span>
                  <span className="font-mono font-bold text-slate-900">
                    {cc.score} / {cc.maxScore}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      cc.score >= 700 ? "bg-emerald-500" : cc.score >= 550 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${(cc.score / cc.maxScore) * 100}%` }}
                  />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Active Loans</dt>
                  <dd className="font-medium text-slate-900">{cc.activeLoanCount}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Total Exposure</dt>
                  <dd className="font-mono font-medium text-slate-900">{formatMoney(cc.totalExposure)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Missed (30d)</dt>
                  <dd className="font-medium text-slate-900">{cc.missedPayments30}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Missed (60d)</dt>
                  <dd className="font-medium text-slate-900">{cc.missedPayments60}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Missed (90d)</dt>
                  <dd className="font-medium text-slate-900">{cc.missedPayments90}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Judgments</dt>
                  <dd className="font-medium text-slate-900">{cc.judgments}</dd>
                </div>
              </dl>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {cc.blacklisted ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
                    <XCircle className="w-4 h-4" /> Blacklisted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> Not Blacklisted
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Affordability */}
        {af && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-slate-900">Affordability Assessment</h2>
            </div>
            <dl className="space-y-3 text-sm">
              {([
                ["Gross Income", formatMoney(af.grossIncome)],
                ["Deductions", formatMoney(af.deductions)],
                ["Net Income", formatMoney(af.netIncome)],
                ["Existing Obligations", formatMoney(af.existingObligations)],
                ["Disposable Income", formatMoney(af.disposableIncome)],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-mono font-medium text-slate-900">{value}</dd>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <dt className="text-slate-500">Proposed Instalment</dt>
                <dd className="font-mono font-bold text-slate-900">{formatMoney(af.proposedInstalment)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">DTI Ratio</dt>
                <dd className={cn("font-mono font-medium", af.dtiRatio <= 0.6 ? "text-emerald-600" : "text-red-600")}>
                  {(af.dtiRatio * 100).toFixed(1)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Instalment Ratio</dt>
                <dd className={cn("font-mono font-medium", af.instalmentRatio <= 0.3 ? "text-emerald-600" : "text-red-600")}>
                  {(af.instalmentRatio * 100).toFixed(1)}%
                </dd>
              </div>
              <div className="pt-3 border-t border-slate-100">
                {af.passes ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> Passes affordability check
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
                    <XCircle className="w-4 h-4" /> Fails affordability check
                  </span>
                )}
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Risk score radar */}
      {riskComponents.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-900">Risk Score Breakdown</h2>
            <span
              className={cn(
                "ml-auto inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold",
                overallRisk >= 80
                  ? "bg-emerald-100 text-emerald-700"
                  : overallRisk >= 60
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {overallRisk}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <RadarChart components={riskComponents} />
            <div className="space-y-3">
              {riskComponents.map((comp: any) => (
                <div key={comp.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{comp.label}</span>
                    <span className="font-mono font-medium text-slate-900">{comp.score}/100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        comp.score >= 80 ? "bg-emerald-500" : comp.score >= 60 ? "bg-amber-500" : "bg-red-500"
                      )}
                      style={{ width: `${comp.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Decision actions */}
      {(app.status === "submitted" || app.status === "under_review") && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Decision</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={() => setDecision("approve")}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors",
                decision === "approve"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => setDecision("decline")}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors",
                decision === "decline"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              )}
            >
              <XCircle className="w-4 h-4" />
              Decline
            </button>
          </div>
          {decision && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                {decision === "approve" ? "Approval notes (optional)" : "Decline reason (required)"}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={
                  decision === "approve"
                    ? "Add any notes for this approval..."
                    : "Explain the reason for declining..."
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <button
                onClick={handleSubmitDecision}
                disabled={submitting || (decision === "decline" && !reason.trim())}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors",
                  decision === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700",
                  (submitting || (decision === "decline" && !reason.trim())) && "opacity-50 cursor-not-allowed"
                )}
              >
                {submitting ? "Submitting..." : `Confirm ${decision === "approve" ? "Approval" : "Decline"}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
