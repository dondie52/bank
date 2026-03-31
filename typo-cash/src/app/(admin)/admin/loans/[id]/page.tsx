"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Wallet,
  Calculator,
  Calendar,
  Clock,
  RefreshCw,
  Send,
  Trash2,
  AlertTriangle,
} from "lucide-react";

/* ---------- demo data ---------- */

const loan = {
  id: "TC-202601-00056",
  borrower: { id: "BOR-001", name: "Mpho Kgosi" },
  product: "Instalment",
  status: "active",
  disbursedDate: "2026-01-15",
  maturityDate: "2026-04-15",
  termDays: 90,
  interestRate: 18,

  balance: {
    principal: 500000n,
    interestCharged: 90000n,
    originationFee: 7500n,
    totalDue: 597500n,
    totalPaid: 540000n,
    outstanding: 180000n,
    penaltiesAccrued: 0n,
  },

  schedule: [
    { dueDate: "2026-01-30", instalment: 180000n, principal: 155000n, interest: 25000n, status: "paid" },
    { dueDate: "2026-02-28", instalment: 180000n, principal: 160000n, interest: 20000n, status: "paid" },
    { dueDate: "2026-03-30", instalment: 180000n, principal: 165000n, interest: 15000n, status: "paid" },
    { dueDate: "2026-04-15", instalment: 57500n, principal: 20000n, interest: 30000n, status: "upcoming" },
  ],

  payments: [
    { date: "2026-03-15", amount: 180000n, method: "Bank Transfer", reference: "PAY-003", status: "completed" },
    { date: "2026-02-15", amount: 180000n, method: "Bank Transfer", reference: "PAY-002", status: "completed" },
    { date: "2026-01-30", amount: 180000n, method: "Bank Transfer", reference: "PAY-001", status: "completed" },
  ],
};

/* ---------- page ---------- */

export default function LoanDetailPage() {
  const [actionModal, setActionModal] = useState<"" | "restructure" | "collections" | "writeoff">("");
  const [actionReason, setActionReason] = useState("");

  const l = loan;
  const bal = l.balance;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <a
          href="/admin/loans"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Loans
        </a>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-mono">{l.id}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {l.product} &middot;{" "}
              <a href={`/admin/borrowers/${l.borrower.id}`} className="text-primary hover:underline">
                {l.borrower.name}
              </a>
            </p>
          </div>
          <StatusBadge status={l.status} className="text-sm px-3 py-1" />
        </div>
      </div>

      {/* Loan info summary */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-slate-900">Loan Summary</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {([
            ["Disbursed", l.disbursedDate],
            ["Maturity", l.maturityDate],
            ["Term", `${l.termDays} days`],
            ["Interest Rate", `${l.interestRate}%`],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Balance breakdown */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-slate-900">Balance Breakdown</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <dl className="space-y-2 text-sm">
            {([
              ["Principal", bal.principal],
              ["Interest Charged", bal.interestCharged],
              ["Origination Fee", bal.originationFee],
              ["Penalties Accrued", bal.penaltiesAccrued],
            ] as [string, bigint][]).map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-mono font-medium text-slate-900">{formatMoney(value)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="text-slate-700 font-medium">Total Due</dt>
              <dd className="font-mono font-bold text-slate-900">{formatMoney(bal.totalDue)}</dd>
            </div>
          </dl>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Total Paid</dt>
              <dd className="font-mono font-medium text-emerald-600">{formatMoney(bal.totalPaid)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="text-slate-700 font-medium">Outstanding</dt>
              <dd className="font-mono font-bold text-slate-900">{formatMoney(bal.outstanding)}</dd>
            </div>
            {/* Progress bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Payment progress</span>
                <span>{Math.round((Number(bal.totalPaid) / Number(bal.totalDue)) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(Number(bal.totalPaid) / Number(bal.totalDue)) * 100}%` }}
                />
              </div>
            </div>
          </dl>
        </div>
      </div>

      {/* Repayment schedule */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-slate-900">Repayment Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Due Date</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Instalment</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Principal</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Interest</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {l.schedule.map((row, i) => (
                <tr key={i} className={cn("transition-colors", row.status === "upcoming" && "bg-sky-50/50")}>
                  <td className="px-4 py-3 text-sm text-slate-700">{row.dueDate}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-slate-900">{formatMoney(row.instalment)}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-slate-600">{formatMoney(row.principal)}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-slate-600">{formatMoney(row.interest)}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-slate-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Date</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Amount</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Method</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Reference</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {l.payments.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{p.date}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right text-slate-900">{formatMoney(p.amount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.method}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-600">{p.reference}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override actions */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-slate-900">Admin Actions</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={() => { setActionModal("restructure"); setActionReason(""); }}
            className={cn(
              "flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
              actionModal === "restructure"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Restructure Loan
          </button>
          <button
            onClick={() => { setActionModal("collections"); setActionReason(""); }}
            className={cn(
              "flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
              actionModal === "collections"
                ? "bg-red-600 text-white"
                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            )}
          >
            <Send className="w-4 h-4" />
            Send to Collections
          </button>
          <button
            onClick={() => { setActionModal("writeoff"); setActionReason(""); }}
            className={cn(
              "flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
              actionModal === "writeoff"
                ? "bg-slate-700 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
            )}
          >
            <Trash2 className="w-4 h-4" />
            Write Off
          </button>
        </div>

        {actionModal && (
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">
              {actionModal === "restructure" && "Restructure this loan — provide new terms and reason."}
              {actionModal === "collections" && "Transfer this loan to the collections queue."}
              {actionModal === "writeoff" && "Write off this loan. This action requires manager approval."}
            </p>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
              placeholder="Provide a reason for this action..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <div className="flex gap-2">
              <button
                disabled={!actionReason.trim()}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors",
                  actionModal === "restructure" && "bg-amber-600 hover:bg-amber-700",
                  actionModal === "collections" && "bg-red-600 hover:bg-red-700",
                  actionModal === "writeoff" && "bg-slate-700 hover:bg-slate-800",
                  !actionReason.trim() && "opacity-50 cursor-not-allowed"
                )}
              >
                Confirm{" "}
                {actionModal === "restructure" ? "Restructure" : actionModal === "collections" ? "Collections Transfer" : "Write Off"}
              </button>
              <button
                onClick={() => setActionModal("")}
                className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
