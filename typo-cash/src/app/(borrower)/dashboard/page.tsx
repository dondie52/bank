"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { NBFIRABadge } from "@/components/brand/nbfira-badge";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { useBorrower } from "@/hooks/use-borrower";
import { useMyLoans } from "@/hooks/use-loans";
import { useMyPayments } from "@/hooks/use-payments";
import {
  PlusCircle,
  Calendar,
  Wallet,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { borrower, loading: borrowerLoading } = useBorrower();
  const { data: loans, isLoading: loansLoading } = useMyLoans();
  const { data: payments, isLoading: paymentsLoading } = useMyPayments();

  const loading = borrowerLoading || loansLoading;

  // Find the first active or overdue loan
  const activeLoan = loans?.find(
    (l: { status: string }) => l.status === "active" || l.status === "overdue"
  );

  // Build recent activity from payments (most recent 5)
  const recentActivity = (payments ?? []).slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const percentPaid =
    activeLoan && activeLoan.total_repayable > 0
      ? Math.round(
          ((activeLoan.total_paid ?? 0) * 100) / activeLoan.total_repayable
        )
      : 0;

  // Calculate next payment info from repayment schedules if available
  const nextSchedule = activeLoan?.repayment_schedules
    ?.filter((s: { status: string }) => s.status === "pending" || s.status === "due")
    ?.sort(
      (a: { due_date: string }, b: { due_date: string }) =>
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )?.[0];

  const daysUntilPayment = nextSchedule
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextSchedule.due_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Hello, {borrower?.first_name ?? "there"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Here&apos;s your loan overview</p>
      </div>

      {/* Active loan card */}
      {activeLoan ? (
        <Link
          href={`/loans/${activeLoan.id}`}
          className="block bg-white rounded-xl shadow-card p-5 border-l-4 border-primary hover:shadow-card-hover transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-slate-500">
                {activeLoan.reference_number}
              </span>
            </div>
            <StatusBadge status={activeLoan.status} />
          </div>

          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500">Outstanding Balance</p>
              <p className="text-2xl font-mono font-bold text-slate-900">
                {formatMoney(BigInt(activeLoan.outstanding_principal ?? 0))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Paid</p>
              <p className="text-lg font-mono font-semibold text-emerald-600">
                {percentPaid}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentPaid}%` }}
            />
          </div>

          {/* Next payment */}
          {nextSchedule && (
            <div className="flex items-center gap-3 bg-sky-50 rounded-lg p-3">
              <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Next Payment Due</p>
                <p className="text-sm font-semibold text-slate-900">
                  {nextSchedule.due_date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-semibold text-slate-900">
                  {formatMoney(BigInt(nextSchedule.amount_due ?? 0))}
                </p>
                {daysUntilPayment !== null && (
                  <p className="text-xs text-sky-600">{daysUntilPayment} days</p>
                )}
              </div>
            </div>
          )}
        </Link>
      ) : (
        <div className="bg-white rounded-xl shadow-card p-6 text-center">
          <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No Active Loans</h3>
          <p className="text-sm text-slate-500 mb-4">
            Apply for your first loan and get funded in minutes.
          </p>
        </div>
      )}

      {/* Quick apply */}
      <Link
        href="/apply"
        className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
      >
        <PlusCircle className="w-5 h-5" />
        Apply for a Loan
      </Link>

      {/* Recent activity */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Activity</h2>
          <Link href="/history" className="text-sm text-primary font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {paymentsLoading ? (
            <div className="px-5 py-4 text-sm text-slate-500">Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div className="px-5 py-4 text-sm text-slate-500">No recent activity</div>
          ) : (
            recentActivity.map((item: { id: string; description?: string; amount_thebe: number; received_at: string; loans?: { reference_number: string } }) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    Payment — {item.loans?.reference_number ?? "Loan"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.received_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-mono font-medium text-slate-700">
                  {formatMoney(BigInt(item.amount_thebe ?? 0))}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <NBFIRABadge variant="compact" className="mx-auto" />
    </div>
  );
}
