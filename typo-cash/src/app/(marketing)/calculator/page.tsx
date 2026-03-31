import { CalculatorWidget } from "@/components/loan/calculator-widget";
import { NBFIRABadge } from "@/components/brand/nbfira-badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Calculator",
  description: "Calculate your loan repayment. See exactly what you'll pay — no hidden fees.",
};

export default function CalculatorPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Loan Calculator</h1>
        <p className="mt-2 text-slate-600">
          See exactly what you&apos;ll repay. No hidden fees, no surprises.
        </p>
      </div>

      <CalculatorWidget variant="standalone" />

      <div className="mt-8 text-center space-y-4">
        <NBFIRABadge className="mx-auto" />
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          This calculator provides an estimate. Actual amounts may vary based on your
          credit assessment. Interest is calculated using simple interest only.
        </p>
      </div>
    </div>
  );
}
