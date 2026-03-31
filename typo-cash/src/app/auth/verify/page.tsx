"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { OTPInput } from "@/components/common/otp-input";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function VerifyContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const isRegister = searchParams.get("register") === "true";

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOTPComplete = async (otp: string) => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      // If registering, create the borrower profile
      if (isRegister) {
        const regDataStr = sessionStorage.getItem("register_data");
        if (regDataStr) {
          const regData = JSON.parse(regDataStr);
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Insert user record
            await supabase.from("users").upsert({
              id: user.id,
              mobile_number: phone,
              role: "borrower",
              status: "active",
            }, { onConflict: "id" });

            // Insert borrower profile
            await supabase.from("borrowers").upsert({
              user_id: user.id,
              omang_number: regData.omangNumber,
              first_name: regData.firstName,
              last_name: regData.lastName,
              dob: "1990-01-01", // Placeholder — will be collected in KYC
              gender: "male", // Placeholder
              net_monthly_salary: 0,
              borrower_tier: "new",
            }, { onConflict: "user_id" });
          }

          sessionStorage.removeItem("register_data");
        }
      }

      router.push("/dashboard");
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.signInWithOtp({ phone });
    if (resendError) {
      setError(resendError.message);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo variant="white" size="lg" className="justify-center" />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Verify Your Number</h1>
          <p className="text-sm text-slate-600 mb-8">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-slate-900">{phone || "your phone"}</span>
          </p>

          <OTPInput onComplete={handleOTPComplete} disabled={loading} />

          {loading && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-slate-600">Verifying...</span>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-center text-red-600">{error}</p>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Didn&apos;t receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={countdown > 0}
              className="mt-1 text-sm font-medium text-primary hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
