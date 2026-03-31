"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Clock, Home, FileText } from "lucide-react";
import { COOLING_OFF_HOURS } from "@/lib/constants";

export default function SuccessPage() {
  const [hoursLeft, setHoursLeft] = useState(COOLING_OFF_HOURS);

  useEffect(() => {
    const timer = setInterval(() => {
      setHoursLeft((h) => Math.max(0, h - 1/3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 text-center py-8">
      {/* Success animation */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
        <div className="relative w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Application Submitted!
        </h1>
        <p className="mt-2 text-slate-600">
          Your loan is being processed. You&apos;re now in the 48-hour cooling-off period.
        </p>
      </div>

      {/* Cooling-off countdown */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">Cooling-Off Period</span>
        </div>
        <p className="text-3xl font-mono font-bold text-amber-900">
          {Math.floor(hoursLeft)}h {Math.floor((hoursLeft % 1) * 60)}m
        </p>
        <p className="text-xs text-amber-700 mt-2">
          You can cancel your loan during this period with no penalty.
          Funds will be disbursed after the cooling-off period expires.
        </p>
      </div>

      {/* What happens next */}
      <div className="bg-white rounded-xl shadow-card p-5 text-left">
        <h3 className="font-semibold text-slate-900 mb-3">What Happens Next</h3>
        <div className="space-y-3">
          {[
            { icon: Clock, text: "48-hour cooling-off period starts now" },
            { icon: CheckCircle, text: "After cooling-off, your loan becomes active" },
            { icon: FileText, text: "Funds disbursed to your bank account same day" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
        <Link
          href="/loans"
          className="flex-1 flex items-center justify-center gap-2 h-12 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          View Loans
        </Link>
      </div>
    </div>
  );
}
