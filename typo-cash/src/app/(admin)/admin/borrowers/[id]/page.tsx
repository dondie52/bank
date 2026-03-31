"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Wallet,
  Clock,
  AlertTriangle,
  Flag,
  StickyNote,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";

/* ---------- demo data ---------- */

const borrower = {
  id: "BOR-001",
  name: "Mpho Kgosi",
  omang: "****5678",
  dob: "1990-04-15",
  phone: "+267 7X 123 456",
  email: "mpho.kgosi@email.com",
  employer: "Debswana Mining",
  monthlySalary: 1200000n,
  address: "Plot 456, Gaborone West, Gaborone",
  tier: "gold",
  joinedDate: "2025-06-15",
  kyc: {
    status: "approved",
    omangVerified: true,
    selfieVerified: true,
    proofOfIncomeVerified: true,
    lastReviewDate: "2025-09-10",
    reviewedBy: "Admin Kebonye",
  },
  loanHistory: [
    { id: "TC-202509-00012", product: "Quick Cash", amount: 200000n, status: "closed", date: "2025-09-20", closedDate: "2025-10-18" },
    { id: "TC-202511-00034", product: "Emergency", amount: 350000n, status: "closed", date: "2025-11-05", closedDate: "2025-12-03" },
    { id: "TC-202601-00056", product: "Instalment", amount: 500000n, status: "active", date: "2026-01-15", closedDate: null },
  ],
  repayments: [
    { date: "2026-03-15", loanRef: "TC-202601-00056", amount: 180000n, method: "Bank Transfer", status: "completed" },
    { date: "2026-02-15", loanRef: "TC-202601-00056", amount: 180000n, method: "Bank Transfer", status: "completed" },
    { date: "2026-01-30", loanRef: "TC-202601-00056", amount: 180000n, method: "Bank Transfer", status: "completed" },
    { date: "2025-12-03", loanRef: "TC-202511-00034", amount: 402500n, method: "Mobile Money", status: "completed" },
    { date: "2025-10-18", loanRef: "TC-202509-00012", amount: 224000n, method: "Bank Transfer", status: "completed" },
  ],
  disputes: [
    { id: "DISP-001", date: "2025-12-10", subject: "Incorrect interest calculation", status: "closed", resolution: "Recalculated; difference of P12.50 credited." },
  ],
  complianceFlags: [
    { type: "info", label: "PEP Check", detail: "Not a PEP", date: "2025-06-15" },
    { type: "ok", label: "Sanctions Screening", detail: "Clear", date: "2025-06-15" },
    { type: "ok", label: "NBFIRA Regulatory Check", detail: "Compliant", date: "2026-01-10" },
  ],
  notes: [
    { date: "2026-01-15", author: "Admin Kebonye", text: "Approved salary-backed upgrade. Strong repayment track record." },
    { date: "2025-09-10", author: "Admin Kebonye", text: "KYC documents verified. All in order." },
  ],
};

const tierConfig: Record<string, { bg: string; text: string }> = {
  new: { bg: "bg-slate-100", text: "text-slate-700" },
  bronze: { bg: "bg-orange-100", text: "text-orange-700" },
  silver: { bg: "bg-slate-200", text: "text-slate-700" },
  gold: { bg: "bg-amber-100", text: "text-amber-700" },
};

/* ---------- page ---------- */

export default function BorrowerDetailPage() {
  const [noteText, setNoteText] = useState("");
  const b = borrower;
  const tc = tierConfig[b.tier] ?? tierConfig.new;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <a
          href="/admin/borrowers"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Borrowers
        </a>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{b.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{b.id} &middot; Joined {b.joinedDate}</p>
          </div>
          <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize", tc.bg, tc.text)}>
            {b.tier} Tier
          </span>
        </div>
      </div>

      {/* Profile + KYC cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-900">Profile Information</h2>
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

        {/* KYC status */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-900">KYC Status</h2>
            <StatusBadge status={b.kyc.status} className="ml-auto" />
          </div>
          <div className="space-y-3">
            {([
              ["Omang Verified", b.kyc.omangVerified],
              ["Selfie Verified", b.kyc.selfieVerified],
              ["Proof of Income", b.kyc.proofOfIncomeVerified],
            ] as [string, boolean][]).map(([label, ok]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                {ok ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                    <XCircle className="w-4 h-4" /> Pending
                  </span>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100 text-sm text-slate-500">
              Last reviewed: {b.kyc.lastReviewDate} by {b.kyc.reviewedBy}
            </div>
          </div>
        </div>
      </div>

      {/* Loan history */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-slate-900">Loan History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Reference</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Product</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Amount</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Date</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Closed</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {b.loanHistory.map((loan) => (
                <tr
                  key={loan.id}
                  onClick={() => (window.location.href = `/admin/loans/${loan.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-slate-900">{loan.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{loan.product}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-slate-900">{formatMoney(loan.amount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{loan.date}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{loan.closedDate ?? "--"}</td>
                  <td className="px-4 py-3"><StatusBadge status={loan.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repayment history */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-slate-900">Repayment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Date</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Loan Ref</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Amount</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Method</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {b.repayments.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-600">{r.date}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-900">{r.loanRef}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-slate-900">{formatMoney(r.amount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.method}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disputes + Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disputes */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-900">Disputes</h2>
          </div>
          {b.disputes.length === 0 ? (
            <p className="text-sm text-slate-500">No disputes on record.</p>
          ) : (
            <div className="space-y-3">
              {b.disputes.map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{d.subject}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{d.id} &middot; {d.date}</p>
                  {d.resolution && (
                    <p className="text-xs text-slate-600 mt-1 italic">{d.resolution}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compliance flags */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-900">Compliance Flags</h2>
          </div>
          <div className="space-y-3">
            {b.complianceFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                {f.type === "ok" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium text-slate-900">{f.label}</p>
                  <p className="text-slate-500">{f.detail} &middot; {f.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-slate-900">Notes</h2>
        </div>
        <div className="space-y-3 mb-4">
          {b.notes.map((n, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-slate-700">{n.author}</span>
                <span className="text-xs text-slate-400">{n.date}</span>
              </div>
              <p className="text-sm text-slate-600">{n.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            disabled={!noteText.trim()}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors",
              !noteText.trim() && "opacity-50 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
