"use client";

import Link from "next/link";
import { ArrowRight, Zap, AlertTriangle, Calendar, Briefcase } from "lucide-react";
import { LOAN_PRODUCTS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "quick-cash": Zap,
  emergency: AlertTriangle,
  instalment: Calendar,
  "salary-backed": Briefcase,
};

const colorMap: Record<string, string> = {
  "quick-cash": "bg-sky-100 text-primary border-primary",
  emergency: "bg-amber-100 text-amber-600 border-amber-400",
  instalment: "bg-emerald-100 text-emerald-600 border-emerald-400",
  "salary-backed": "bg-violet-100 text-violet-600 border-violet-400",
};

export default function ApplyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Apply for a Loan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Choose the product that fits your needs
        </p>
      </div>

      <div className="space-y-4">
        {LOAN_PRODUCTS.map((product) => {
          const Icon = iconMap[product.id] || Zap;
          const colors = colorMap[product.id] || "bg-sky-100 text-primary border-primary";
          const [iconBg] = colors.split(" ");

          return (
            <Link
              key={product.id}
              href={`/apply/${product.id}`}
              className="block bg-white rounded-xl shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {product.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Amount</p>
                      <p className="text-xs font-mono font-medium text-slate-900">
                        {formatMoney(product.minAmount)}–{formatMoney(product.maxAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Rate</p>
                      <p className="text-xs font-mono font-medium text-slate-900">
                        {product.interestRate}% p.a.
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Term</p>
                      <p className="text-xs font-mono font-medium text-slate-900">
                        {product.minTermDays}–{product.maxTermDays} days
                      </p>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
