"use client";

import { User, Mail, Phone, MapPin, Building, Shield, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { NBFIRABadge } from "@/components/brand/nbfira-badge";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { useBorrower } from "@/hooks/use-borrower";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { borrower, user: authUser, loading } = useBorrower();
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!borrower) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Profile not found. Please complete your registration.</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-xl shadow-card p-5 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-primary">
            {borrower.first_name[0]}{borrower.last_name[0]}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {borrower.first_name} {borrower.last_name}
          </h1>
          <p className="text-sm text-slate-500">{authUser?.phone ?? authUser?.email ?? ""}</p>
          <span className="inline-flex items-center px-2 py-0.5 bg-sky-100 text-sky-700 text-xs font-medium rounded-full mt-1">
            {borrower.borrower_tier ?? "Standard"} Member
          </span>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Personal Information</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { icon: User, label: "Full Name", value: `${borrower.first_name} ${borrower.last_name}` },
            { icon: Phone, label: "Phone", value: authUser?.phone ?? "-" },
            { icon: Mail, label: "Email", value: authUser?.email ?? "-" },
            { icon: Shield, label: "Omang", value: `•••••${borrower.omang_number.slice(-4)}` },
            { icon: MapPin, label: "Address", value: [borrower.address, borrower.city].filter(Boolean).join(", ") || "-" },
            { icon: Building, label: "Employer", value: borrower.employer_name ?? "-" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-5 py-3.5">
              <item.icon className="w-4 h-4 text-slate-400" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-sm font-medium text-slate-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {[
          { href: "/kyc", label: "KYC Verification", description: "Manage your identity documents" },
          { href: "/disputes", label: "Disputes", description: "View or create disputes" },
          { href: "/notifications", label: "Notifications", description: "Your notification preferences" },
          { href: "/help", label: "Help & Support", description: "FAQ and contact information" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        ))}
      </div>

      <button
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 w-full h-11 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>

      <NBFIRABadge variant="compact" className="mx-auto" />
    </div>
  );
}
