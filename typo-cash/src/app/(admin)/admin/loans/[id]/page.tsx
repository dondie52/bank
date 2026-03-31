"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { useLoan } from "@/hooks/use-loans";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CardSkeleton } from "@/components/common/loading-skeleton";
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

export default function LoanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: loan, isLoading } = useLoan(id);
  const queryClient = useQueryClient();
  const [actionModal, setActionModal] = useState<"" | "restructure" | "collections" | "writeoff">("");
  const [actionReason, setActionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async () => {
    if (!actionReason.trim() || !loan) return;
    setSubmitting(true);

    const supabase = createClient();
    let newStatus = loan.status;
    if (actionModal === "restructure") newStatus = "restructured";
    if (actionModal === "collections") newStatus = "collections";
    if (actionModal === "writeoff") newStatus = "written_off";

    await supabase
      .from("loans")
      .update({ status: newStatus })
      .eq("id", id);

    queryClient.invalidateQueries({ queryKey: ["loan", id] });
    queryClient.invalidateQueries({ queryKey: ["admin-loans"] });
    setSubmitting(false);
    setActionModal("");
    setActionReason("");
  };

  if (isLoading || !loan) {
    return (
      <div className="space-y-6">
        <div>
          <a href="/admin/loans" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Loans
          </a>
          <h1 className="text-2xl font-bold text-slate-900">Loading...</h1>
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const l = loan;
  const loanProduct = l.loan_products ?? {};
  const schedule = l.repayment_schedules ?? [];
  const payments = l.repayments ?? [];

  const principal = BigInt(l.principal_amount || 0);
  const interestCharged = BigInt(l.total_interest || 0);
  const originationFee = BigInt(l.origination_fee || 0);
  const totalDue = BigInt(l.total_repayable || 0);
  const totalPaid = BigInt(l.total_paid || 0);
  const outstanding = BigInt(l.outstanding_principal || 0);
  const penalties = BigInt(l.penalties_accrued || 0);

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
            <h1 className="text-2xl font-bold text-slate-900 font-mono">{l.reference_number ?? l.id.slice(0, 12)}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {loanProduct.name ?? "--"} &middot;{" "}
              <a href={`/admin/borrowers/${l.borrower_id}`} className="text-primary hover:underline">
                Borrower
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
            ["Disbursed", l.disbursed_at ? new Date(l.disbursed_at).toISOString().slice(0, 10) : "--"],
            ["Maturity", l.maturity_date ? new Date(l.maturity_date).toISOString().slice(0, 10) : "--"],
            ["Term", `${l.term_days ?? "--"} days`],
            ["Interest Rate", `${loanProduct.interest_rate ?? l.interest_rate ?? "--"}%`],
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
              ["Principal", principal],
              ["Interest Charged", interestCharged],
              ["Origination Fee", originationFee],
              ["Penalties Accrued", penalties],
            ] as [string, bigint][]).map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-mono font-medium text-slate-900">{formatMoney(value)}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="text-slate-700 font-medium">Total Due</dt>
              <dd className="font-mono font-bold text-slate-900">{formatMoney(totalDue)}</dd>
            </div>
          </dl>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Total Paid</dt>
              <dd className="font-mono font-medium text-emerald-600">{formatMoney(totalPaid)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="text-slate-700 font-medium">Outstanding</dt>
              <dd className="font-mono font-bold text-slate-900">{formatMoney(outstanding)}</dd>
            </div>
            {/* Progress bar */}
            {totalDue > 0n && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Payment progress</span>
                  <span>{Math.round((Number(totalPaid) / Number(totalDue)) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(Number(totalPaid) / Number(totalDue)) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Repayment schedule */}
      {schedule.length > 0 && (
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
                {schedule.map((row: any, i: number) => (
                  <tr key={i} className={cn("transition-colors", row.status === "upcoming" && "bg-sky-50/50")}>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.due_date ? new Date(row.due_date).toISOString().slice(0, 10) : "--"}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-slate-900">
                      {formatMoney(BigInt(row.instalment_amount || 0))}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-slate-600">
                      {formatMoney(BigInt(row.principal_portion || 0))}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-slate-600">
                      {formatMoney(BigInt(row.interest_portion || 0))}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={row.status ?? "upcoming"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment history */}
      {payments.length > 0 && (
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
                {payments.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {p.received_at ? new Date(p.received_at).toISOString().slice(0, 10) : "--"}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-slate-900">
                      {formatMoney(BigInt(p.amount || 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.method ?? "--"}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{p.reference ?? "--"}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status ?? "completed"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Override actions */}
      {l.status !== "closed" && l.status !== "written_off" && (
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
                  onClick={handleAction}
                  disabled={!actionReason.trim() || submitting}
                  className={cn(
                    "px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors",
                    actionModal === "restructure" && "bg-amber-600 hover:bg-amber-700",
                    actionModal === "collections" && "bg-red-600 hover:bg-red-700",
                    actionModal === "writeoff" && "bg-slate-700 hover:bg-slate-800",
                    (!actionReason.trim() || submitting) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {submitting ? "Submitting..." : `Confirm ${actionModal === "restructure" ? "Restructure" : actionModal === "collections" ? "Collections Transfer" : "Write Off"}`}
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
      )}
    </div>
  );
}
