"use client";

import { useState, useMemo } from "react";
import { StatusBadge } from "@/components/common/status-badge";
import { useAllBorrowers } from "@/hooks/use-borrowers";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/lib/utils";
import { Search, Users, Filter } from "lucide-react";

type Tier = "all" | "new" | "bronze" | "silver" | "gold";

const tierConfig: Record<Exclude<Tier, "all">, { bg: string; text: string }> = {
  new: { bg: "bg-slate-100", text: "text-slate-700" },
  bronze: { bg: "bg-orange-100", text: "text-orange-700" },
  silver: { bg: "bg-slate-200", text: "text-slate-700" },
  gold: { bg: "bg-amber-100", text: "text-amber-700" },
};

function TierBadge({ tier }: { tier: string }) {
  const c = tierConfig[tier as Exclude<Tier, "all">] ?? tierConfig.new;
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", c.bg, c.text)}>
      {tier}
    </span>
  );
}

const tierTabs: { key: Tier; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "bronze", label: "Bronze" },
  { key: "silver", label: "Silver" },
  { key: "gold", label: "Gold" },
];

export default function BorrowersPage() {
  const { data: rawBorrowers, isLoading } = useAllBorrowers();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<Tier>("all");

  const borrowers = useMemo(() => {
    return (rawBorrowers ?? []).map((b: any) => ({
      id: b.id,
      name: `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim() || "Unknown",
      omang: b.omang_number ? `****${b.omang_number.slice(-4)}` : "----",
      phone: b.users?.mobile_number ?? "--",
      tier: b.borrower_tier ?? "new",
      kycStatus: b.kyc_profiles?.[0]?.verification_status ?? b.kyc_profiles?.verification_status ?? "pending",
      activeLoans: 0, // not available in the list query
    }));
  }, [rawBorrowers]);

  const filtered = useMemo(() => {
    let list = borrowers;

    if (tierFilter !== "all") {
      list = list.filter((b: any) => b.tier === tierFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b: any) =>
          b.name.toLowerCase().includes(q) ||
          b.omang.includes(q) ||
          b.phone.includes(q) ||
          b.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [borrowers, search, tierFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Borrowers</h1>
        </div>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <a href="/admin" className="hover:text-primary transition-colors">Dashboard</a>
            <span>/</span>
            <span className="text-slate-900 font-medium">Borrowers</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Borrowers</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          <span>{filtered.length} borrower{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Tier tabs */}
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-slate-400 mr-1" />
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              {tierTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTierFilter(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    tierFilter === tab.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, Omang, phone, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Name</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Omang</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Phone</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Tier</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">KYC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((b: any) => (
                <tr
                  key={b.id}
                  onClick={() => (window.location.href = `/admin/borrowers/${b.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{b.name}</p>
                      <p className="text-xs text-slate-500">{b.id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-mono text-slate-600">{b.omang}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-600">{b.phone}</td>
                  <td className="px-6 py-3.5 text-center">
                    <TierBadge tier={b.tier} />
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <StatusBadge status={b.kycStatus} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No borrowers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
