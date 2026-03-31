"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OTPInput } from "@/components/common/otp-input";
import { createClient } from "@/lib/supabase/client";
import { Shield, Loader2, FileText } from "lucide-react";

export default function AgreementPage() {
  const params = useParams();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "st">("en");

  const handleSign = async (otp: string) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get the latest application for this product to get the application_id
      const { data: app } = await supabase
        .from("loan_applications")
        .select("id")
        .eq("product_id", params.productId as string)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!app) throw new Error("Application not found");

      const { error: fnError } = await supabase.functions.invoke("sign-agreement", {
        body: { application_id: app.id, otp },
      });

      if (fnError) throw fnError;
      router.push(`/apply/${params.productId}/success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign agreement");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Loan Agreement</h1>
          <p className="text-xs text-slate-500">Please read carefully before signing</p>
        </div>
      </div>

      {/* Language toggle */}
      <div className="flex gap-2">
        {[
          { code: "en" as const, label: "English" },
          { code: "st" as const, label: "Setswana" },
        ].map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              lang === l.code
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-sky-50"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Agreement text */}
      <div className="bg-white rounded-xl shadow-card p-5 max-h-80 overflow-y-auto">
        <div className="prose prose-sm prose-slate">
          <h3>MICRO-LENDING CREDIT AGREEMENT</h3>
          <p>Between <strong>Typo Cash Solutions (Pty) Ltd</strong> (&quot;the Lender&quot;) and the Borrower identified herein.</p>

          <h4>1. Definitions</h4>
          <p>In this agreement: &quot;Principal&quot; means the amount lent; &quot;Interest&quot; means simple interest calculated as Principal x Rate x Days / 365; &quot;Cooling-Off Period&quot; means the 48-hour period following the signing of this agreement.</p>

          <h4>2. Loan Terms</h4>
          <p>The Lender agrees to advance the Principal Amount to the Borrower subject to these terms. Interest is calculated using <strong>simple interest only</strong> in accordance with NBFIRA regulations.</p>

          <h4>3. Cooling-Off Period</h4>
          <p>The Borrower has <strong>48 hours</strong> from the date of signing to cancel this agreement without penalty. During this period, no funds will be disbursed.</p>

          <h4>4. Repayment</h4>
          <p>The Borrower shall repay the Total Repayable Amount in accordance with the repayment schedule. Payments are applied in the following order: penalties, interest, then principal.</p>

          <h4>5. Late Payment</h4>
          <p>A penalty of up to 5% per month of the outstanding principal may be charged. Total penalties shall never exceed the outstanding principal (cumulative cap). Total interest and penalties together shall never exceed the original principal (in duplum rule).</p>

          <h4>6. Early Repayment</h4>
          <p>The Borrower may repay the loan in full at any time without early repayment penalties.</p>

          <h4>7. Disputes</h4>
          <p>Any disputes shall be reported to Typo Cash Solutions within 14 days. Collections activity is paused during dispute resolution. Unresolved disputes may be escalated to NBFIRA.</p>

          <h4>8. Governing Law</h4>
          <p>This agreement is governed by the laws of the Republic of Botswana and the regulations of NBFIRA.</p>
        </div>
      </div>

      {/* Agree checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
        />
        <span className="text-sm text-slate-700">
          I have read and understood this agreement. I accept the terms and conditions,
          including the cooling-off period and penalty terms.
        </span>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Sign with OTP */}
      {!showOTP ? (
        <button
          onClick={() => setShowOTP(true)}
          disabled={!agreed}
          className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Shield className="w-5 h-5" />
          Sign with OTP
        </button>
      ) : (
        <div className="bg-slate-50 rounded-xl p-5 space-y-4">
          <p className="text-sm text-center text-slate-600">
            Enter the 6-digit OTP sent to your phone to sign this agreement
          </p>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-slate-600">Signing agreement...</span>
            </div>
          ) : (
            <OTPInput onComplete={handleSign} />
          )}
        </div>
      )}
    </div>
  );
}
