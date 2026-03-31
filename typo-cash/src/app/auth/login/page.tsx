"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Phone, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("+267");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^\+267[0-9]{8}$/.test(phone)) {
      setError("Enter a valid Botswana phone number");
      return;
    }

    setLoading(true);
    // AUTH DISABLED for phone — bypass to dashboard until Twilio is configured
    router.push("/dashboard");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (adminUser) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo variant="white" size="lg" className="justify-center" />
          <p className="mt-2 text-white/80 text-sm">Quick Cash, Real Solutions</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-600 mb-4">
            Sign in to your account
          </p>

          {/* Toggle between phone and email */}
          <div className="flex rounded-lg border border-slate-200 p-1 mb-6">
            <button
              onClick={() => { setMode("phone"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                mode === "phone"
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Phone
            </button>
            <button
              onClick={() => { setMode("email"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                mode === "email"
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Email
            </button>
          </div>

          {mode === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+26771234567"
                    className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
