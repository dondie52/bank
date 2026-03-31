"use client";

import { useState, useMemo } from "react";
import { calculateSimpleInterest } from "@/lib/loan-engine/interest-calculator";
import { formatMoney, pulaToThebe } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Calculator, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CalculatorWidgetProps {
  className?: string;
  variant?: "hero" | "standalone";
}

const termOptions = [14, 30, 60, 90];

export function CalculatorWidget({ className, variant = "hero" }: CalculatorWidgetProps) {
  const [amount, setAmount] = useState(2000);
  const [termDays, setTermDays] = useState(30);

  const calculation = useMemo(() => {
    const principal = pulaToThebe(amount);
    // Auto-select rate based on amount and term
    let rate = 12;
    if (amount > 5000) rate = 18;
    else if (amount > 3000) rate = 15;
    else if (termDays <= 30) rate = 12;

    const interest = calculateSimpleInterest(principal, rate, termDays);
    const totalRepayable = principal + interest;
    const numInstalments = termDays <= 30 ? 1 : Math.ceil(termDays / 30);
    const instalment = totalRepayable / BigInt(numInstalments);

    return {
      principal,
      interest,
      totalRepayable,
      instalment,
      numInstalments,
      rate,
    };
  }, [amount, termDays]);

  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        isHero ? "bg-white shadow-lg" : "bg-white shadow-card border border-slate-200",
        className
      )}
    >
      <div className={cn(
        "px-5 py-4 flex items-center gap-2",
        isHero ? "bg-sky-50" : "bg-slate-50 border-b border-slate-200"
      )}>
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="text-base font-semibold text-slate-900">Loan Calculator</h3>
      </div>

      <div className="p-5 space-y-6">
        {/* Amount slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">
              How much do you need?
            </label>
            <span className="text-lg font-mono font-bold text-primary">
              P{amount.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={7000}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-sky-100 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>P500</span>
            <span>P7,000</span>
          </div>
        </div>

        {/* Term buttons */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Repayment period
          </label>
          <div className="grid grid-cols-4 gap-2">
            {termOptions.map((days) => (
              <button
                key={days}
                onClick={() => setTermDays(days)}
                className={cn(
                  "h-10 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  termDays === days
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-primary"
                )}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-sky-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Total Repayable</span>
            <span className="text-xl font-mono font-bold text-slate-900">
              {formatMoney(calculation.totalRepayable)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">
              {calculation.numInstalments > 1
                ? `${calculation.numInstalments} Instalments of`
                : "Single Payment"}
            </span>
            <span className="text-lg font-mono font-semibold text-primary">
              {formatMoney(calculation.instalment)}
            </span>
          </div>
          <div className="pt-2 border-t border-sky-200 flex justify-between text-xs text-slate-500">
            <span>Fee: {formatMoney(calculation.interest)}</span>
            <span>Rate: {calculation.rate}% p.a.</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/apply"
          className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors duration-200 shadow-sm cursor-pointer"
        >
          Apply Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
