"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { useBorrowerDetail } from "@/hooks/use-borrowers";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Wallet,
  Clock,
  AlertTriangle,
  Flag,
  StickyNote,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";

const tierConfig: Record<string, { bg: string; text: string }> = {
  new: { bg: "bg-slate-100", text: "text-slate-700" },
  bronze: { bg: "bg-orange-100", text: "text-orange-700" },
  silver: { bg: "bg-slate-200", text: "text-slate-700" },
  gold: { bg: "bg-amber-100", text: "text-amber-700" },
};

export default function BorrowerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: rawBorrower, isLoading } = useBorrowerDetail(id);
  const [noteText, setNoteText] = useState("");

  if (isLoading || !rawBorrower) {
    return (
      <div className="space-y-6">
        <div>
          <a href="/admin/borrowers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Borrowers
          </a>
          <h1 className="text-2xl font-bold text-slate-900">Loading...</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const b = rawBorrower;
  const userInfo = b.users ?? {};
  const kycProfile = b.kyc_profiles?.[0] ?? b.kyc_profiles ?? {};
  const tier = b.borrower_tier ?? "new";
  const tc = tierConfig[tier] ?? tierConfig.new;

  const borrowerName = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim();
  const omang = b.omang_number ? `****${b.omang_number.slice(-4)}` : "----";

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <a
          href="/admin/borrowers"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Borrowers
        </a>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{borrowerName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {b.id.slice(0, 8)}... &middot; Joined {b.created_at ? new Date(b.created_at).toISOString().slice(0, 10) : "--"}
            </p>
          </div>
          <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize", tc.bg, tc.text)}>
            {tier} Tier
          </span>
        </div>
      </div>

      {/* Profile + KYC cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-900">Profile Information</h2>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {([
              ["Full Name", borrowerName],
              ["Omang", omang],
              ["Date of Birth", b.dob ?? "--"],
              ["Phone", userInfo.mobile_number ?? "--"],
              ["Email", userInfo.email ?? "--"],
              ["Employer", b.employer_name ?? "--"],
              ["Monthly Salary", formatMoney(BigInt(b.net_monthly_salary || 0))],
              ["Address", [b.address, b.city, b.district].filter(Boolean).join(", ") || "--"],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <dt className="text-slate-500">{label}</dt>
                <dd className={cn("font-medium text-slate-900", label === "Monthly Salary" && "font-mono")}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* KYC status */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-900">KYC Status</h2>
            <StatusBadge status={kycProfile.verification_status ?? "pending"} className="ml-auto" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Verification Status</span>
              <span className="font-medium text-slate-900 capitalize">{kycProfile.verification_status ?? "pending"}</span>
            </div>
            {kycProfile.reviewed_at && (
              <div className="pt-3 border-t border-slate-100 text-sm text-slate-500">
                Last reviewed: {new Date(kycProfile.reviewed_at).toISOString().slice(0, 10)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional info placeholder sections */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-slate-900">Borrower Details</h2>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div>
            <dt className="text-slate-500">Gender</dt>
            <dd className="font-medium text-slate-900 capitalize">{b.gender ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Marital Status</dt>
            <dd className="font-medium text-slate-900 capitalize">{b.marital_status ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Employer Phone</dt>
            <dd className="font-medium text-slate-900">{b.employer_phone ?? "--"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Employment Start</dt>
            <dd className="font-medium text-slate-900">{b.employment_start_date ?? "--"}</dd>
          </div>
        </dl>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-slate-900">Notes</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">Admin notes are not yet stored in the database.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            disabled={!noteText.trim()}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors",
              !noteText.trim() && "opacity-50 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
