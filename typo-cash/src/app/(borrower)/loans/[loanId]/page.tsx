"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { useLoan } from "@/hooks/use-loans";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function LoanDetailPage() {
  const params = useParams();
  const { data: loan, isLoading } = useLoan(params.loanId as string);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Loan not found</p>
        <Link href="/loans" className="text-primary hover:underline text-sm mt-2 inline-block">
          Back to loans
        </Link>
      </div>
    );
  }

  const outstandingPrincipal = loan.outstanding_principal ?? 0;
  const outstandingInterest = loan.outstanding_interest ?? 0;
  const outstandingPenalties = loan.outstanding_penalties ?? 0;
  const totalOutstanding = outstandingPrincipal + outstandingInterest + outstandingPenalties;
  const totalRepayable = loan.total_repayable ?? 0;
  const totalPaid = loan.total_paid ?? 0;
  const paidPercent = totalRepayable > 0 ? Math.round((totalPaid * 100) / totalRepayable) : 0;

  const schedule = (loan.repayment_schedules ?? []).sort(
    (a: { due_date: string }, b: { due_date: string }) =>
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/loans" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">
            {loan.loan_products?.name ?? "Loan"}
          </h1>
          <p className="text-xs text-slate-500">{loan.reference_number}</p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      {/* Circular progress */}
      <div className="bg-white rounded-xl shadow-card p-6 flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${paidPercent * 2.64} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-900">{paidPercent}%</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Total Outstanding</p>
          <p className="text-2xl font-mono font-bold text-slate-900">
            {formatMoney(BigInt(Math.round(totalOutstanding)))}
          </p>
          <p className="text-xs text-slate-500">
            of {formatMoney(BigInt(Math.round(totalRepayable)))} total
          </p>
        </div>
      </div>

      {/* Balance breakdown */}
      <div className="bg-white rounded-xl shadow-card p-5 space-y-3">
        <h3 className="font-semibold text-slate-900">Balance Breakdown</h3>
        {[
          { label: "Outstanding Principal", value: outstandingPrincipal, icon: TrendingDown },
          { label: "Outstanding Interest", value: outstandingInterest, icon: Calendar },
          { label: "Outstanding Penalties", value: outstandingPenalties, icon: AlertCircle },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">{item.label}</span>
            </div>
            <span className="text-sm font-mono font-medium text-slate-900">
              {formatMoney(BigInt(Math.round(item.value)))}
            </span>
          </div>
        ))}
        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-900">Total Paid</span>
          <span className="text-sm font-mono font-bold text-emerald-600">
            {formatMoney(BigInt(Math.round(totalPaid)))}
          </span>
        </div>
      </div>

      {/* Repayment schedule */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Repayment Schedule</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {schedule.length === 0 ? (
            <div className="px-5 py-4 text-sm text-slate-500">No schedule available</div>
          ) : (
            schedule.map((s: { id: string; instalment_number: number; due_date: string; amount_due: number; status: string }, idx: number) => (
              <div key={s.id ?? idx} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  s.status === "paid" ? "bg-emerald-100" : "bg-slate-100"
                }`}>
                  {s.status === "paid" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    Instalment {s.instalment_number ?? idx + 1}
                  </p>
                  <p className="text-xs text-slate-500">Due {s.due_date}</p>
                </div>
                <span className="text-sm font-mono font-medium text-slate-900">
                  {formatMoney(BigInt(Math.round(s.amount_due ?? 0)))}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Make payment button */}
      {(loan.status === "active" || loan.status === "overdue") && (
        <Link
          href={`/loans/${loan.id}/pay`}
          className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <CreditCard className="w-5 h-5" />
          Make a Payment
        </Link>
      )}
    </div>
  );
}
