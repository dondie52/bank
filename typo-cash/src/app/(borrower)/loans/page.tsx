"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { useMyLoans } from "@/hooks/use-loans";
import { Wallet, ArrowRight } from "lucide-react";

export default function LoansPage() {
  const { data: loans, isLoading } = useMyLoans();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Loans</h1>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Loans</h1>

      {!loans || loans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-8 text-center">
          <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">No Loans Yet</h3>
          <p className="text-sm text-slate-500 mb-4">
            Apply for your first loan to get started.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-6 h-10 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
          >
            Apply Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan: { id: string; reference_number: string; loan_products: { name: string } | null; total_repayable: number; outstanding_principal: number; status: string; maturity_date: string }) => {
            const totalRepayable = loan.total_repayable ?? 0;
            const outstanding = loan.outstanding_principal ?? 0;
            const paidPercent =
              totalRepayable > 0
                ? Math.round(((totalRepayable - outstanding) * 100) / totalRepayable)
                : 0;
            return (
              <Link
                key={loan.id}
                href={`/loans/${loan.id}`}
                className="block bg-white rounded-xl shadow-card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-slate-500">{loan.reference_number}</span>
                    <h3 className="text-base font-semibold text-slate-900">
                      {loan.loan_products?.name ?? "Loan"}
                    </h3>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>

                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-500">Outstanding</p>
                    <p className="text-xl font-mono font-bold text-slate-900">
                      {formatMoney(BigInt(outstanding))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Due</p>
                    <p className="text-sm text-slate-700">{loan.maturity_date}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-slate-500">{paidPercent}% repaid</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
