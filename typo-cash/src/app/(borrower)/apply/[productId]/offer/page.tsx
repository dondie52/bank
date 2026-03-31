"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shield, CheckCircle, ArrowRight } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { NBFIRABadge } from "@/components/brand/nbfira-badge";
import { createClient } from "@/lib/supabase/client";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { LOAN_PRODUCTS } from "@/lib/constants";

interface ApplicationData {
  id: string;
  requested_amount: number;
  requested_term_days: number;
  interest_amount?: number;
  origination_fee?: number;
  total_cost_of_credit?: number;
  total_repayable?: number;
  instalment_amount?: number;
  num_instalments?: number;
  interest_rate?: number;
  loan_products?: { name: string; code: string };
}

export default function OfferPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  const product = LOAN_PRODUCTS.find((p) => p.id === params.productId);

  useEffect(() => {
    const fetchApp = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("loan_applications")
        .select("*, loan_products(name, code)")
        .eq("product_id", params.productId as string)
        .in("status", ["approved", "submitted", "under_review"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setApplication(data);
      setLoading(false);
    };
    fetchApp();
  }, [params.productId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // Build offer from application data or fall back to product defaults
  const principal = application?.requested_amount ?? 0;
  const rate = application?.interest_rate ?? product?.interestRate ?? 12;
  const termDays = application?.requested_term_days ?? 30;
  const interestAmount =
    application?.interest_amount ?? Math.round((principal * rate * termDays) / (365 * 100));
  const originationFee =
    application?.origination_fee ?? Number(product?.originationFee ?? 0);
  const totalCostOfCredit =
    application?.total_cost_of_credit ?? interestAmount + originationFee;
  const totalRepayable =
    application?.total_repayable ?? principal + totalCostOfCredit;
  const numInstalments = application?.num_instalments ?? 1;
  const instalmentAmount =
    application?.instalment_amount ?? Math.round(totalRepayable / numInstalments);
  const penaltyRate = 5.0;
  const coolingOffHours = 48;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Your Loan Offer</h1>
          <p className="text-xs text-emerald-600 font-medium">Pre-approved</p>
        </div>
      </div>

      {/* Regulation 10 Salient Features */}
      <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Regulation 10 - Salient Features
          </span>
        </div>

        <div className="space-y-3">
          {[
            { label: "Principal Amount", value: formatMoney(BigInt(principal)) },
            { label: "Interest Amount", value: formatMoney(BigInt(Math.round(interestAmount))) },
            { label: "Origination Fee", value: formatMoney(BigInt(Math.round(originationFee))) },
            { label: "Total Cost of Credit", value: formatMoney(BigInt(Math.round(totalCostOfCredit))), highlight: true },
            { label: "Total Repayable", value: formatMoney(BigInt(Math.round(totalRepayable))), highlight: true },
            { label: `Instalment (x${numInstalments})`, value: formatMoney(BigInt(Math.round(instalmentAmount))) },
            { label: "Interest Rate", value: `${rate}% per annum (simple interest)` },
            { label: "Term", value: `${termDays} days` },
            { label: "Late Payment Penalty", value: `Up to ${penaltyRate}% of outstanding per month` },
            { label: "Cooling-Off Period", value: `${coolingOffHours} hours (cancel with no penalty)` },
          ].map((item) => (
            <div key={item.label} className={`flex justify-between items-center text-sm ${item.highlight ? "font-bold" : ""}`}>
              <span className="text-slate-600">{item.label}</span>
              <span className={`font-mono ${item.highlight ? "text-primary text-base" : "text-slate-900"}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Important notices */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800 font-medium mb-1">Important</p>
        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
          <li>You have 48 hours after signing to cancel with no penalty</li>
          <li>Interest is calculated using simple interest only</li>
          <li>Penalties are capped and can never exceed your loan amount</li>
          <li>Funds will be disbursed after the cooling-off period</li>
        </ul>
      </div>

      <NBFIRABadge variant="compact" className="mx-auto" />

      <button
        onClick={() => router.push(`/apply/${params.productId}/agreement`)}
        className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
      >
        Accept & Sign Agreement
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
