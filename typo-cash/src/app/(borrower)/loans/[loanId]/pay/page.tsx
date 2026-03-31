"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { formatMoney, pulaToThebe } from "@/lib/money";
import { useLoan } from "@/hooks/use-loans";
import { useSubmitPayment } from "@/hooks/use-payments";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { ArrowLeft, CreditCard, Smartphone, Building, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const paymentMethods = [
  { id: "eft", label: "Bank Transfer (EFT)", icon: Building },
  { id: "debit_order", label: "Debit Order", icon: CreditCard },
  { id: "mobile_money", label: "Mobile Money", icon: Smartphone },
];

export default function PayPage() {
  const params = useParams();
  const loanId = params.loanId as string;
  const { data: loan, isLoading: loanLoading } = useLoan(loanId);
  const submitPayment = useSubmitPayment();

  const outstandingPula = loan
    ? ((loan.outstanding_principal ?? 0) / 100).toFixed(2)
    : "0.00";

  const [amount, setAmount] = useState<string | null>(null);
  const [method, setMethod] = useState("eft");
  const [success, setSuccess] = useState(false);

  // Set default amount once loan loads
  const displayAmount = amount ?? outstandingPula;

  if (loanLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const handlePay = async () => {
    const thebe = pulaToThebe(parseFloat(displayAmount) || 0);
    await submitPayment.mutateAsync({
      loan_id: loanId,
      amount_thebe: Number(thebe),
      payment_method: method,
    });
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="space-y-6 text-center py-12">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Submitted</h1>
          <p className="text-sm text-slate-500 mt-2">
            Your payment of {formatMoney(pulaToThebe(parseFloat(displayAmount)))} is being processed.
          </p>
        </div>
        <Link
          href={`/loans/${loanId}`}
          className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
        >
          Back to Loan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/loans/${loanId}`}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Make a Payment</h1>
      </div>

      <div className="bg-white rounded-xl shadow-card p-5 space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Payment Amount (Pula)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
              P
            </span>
            <input
              type="number"
              step="0.01"
              value={displayAmount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-12 pl-8 pr-4 text-xl font-mono font-bold border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Outstanding: {formatMoney(BigInt(loan?.outstanding_principal ?? 0))}
          </p>
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Payment Method
          </label>
          <div className="space-y-2">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setMethod(pm.id)}
                className={cn(
                  "flex items-center gap-3 w-full p-3 rounded-lg border transition-colors cursor-pointer",
                  method === pm.id
                    ? "border-primary bg-sky-50"
                    : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <pm.icon className={cn(
                  "w-5 h-5",
                  method === pm.id ? "text-primary" : "text-slate-400"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  method === pm.id ? "text-primary" : "text-slate-700"
                )}>
                  {pm.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {submitPayment.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">
            Payment failed. Please try again.
          </p>
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={submitPayment.isPending || !displayAmount}
        className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
      >
        {submitPayment.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay {displayAmount ? formatMoney(pulaToThebe(parseFloat(displayAmount) || 0)) : ""}
          </>
        )}
      </button>
    </div>
  );
}
