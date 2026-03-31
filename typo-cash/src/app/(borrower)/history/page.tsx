"use client";

import { formatMoney } from "@/lib/money";
import { useMyPayments } from "@/hooks/use-payments";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";

export default function HistoryPage() {
  const { data: payments, isLoading } = useMyPayments();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>

      {!payments || payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-8 text-center">
          <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No payment history yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="divide-y divide-slate-100">
            {payments.map((p: { id: string; payment_type?: string; amount_thebe: number; received_at: string; loans?: { reference_number: string } }) => {
              const isIncoming = p.payment_type === "disbursement";
              return (
                <div key={p.id} className="flex items-center gap-3 px-5 py-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isIncoming ? "bg-emerald-100" : "bg-sky-100"
                  }`}>
                    {isIncoming ? (
                      <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {p.loans?.reference_number ?? "Payment"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(p.received_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-sm font-mono font-medium ${
                    isIncoming ? "text-emerald-600" : "text-slate-900"
                  }`}>
                    {isIncoming ? "+" : "-"}{formatMoney(BigInt(p.amount_thebe ?? 0))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
