"use client";

import { useState, useMemo } from "react";
import { formatMoney } from "@/lib/money";
import { useCollectionsCases } from "@/hooks/use-admin";
import { TableSkeleton, CardSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/lib/utils";
import {
  Filter,
  Search,
  ChevronRight,
} from "lucide-react";

type Stage = "all" | "early" | "mid" | "late" | "legal";

const stageColors: Record<string, { bg: string; text: string }> = {
  early: { bg: "bg-amber-100", text: "text-amber-700" },
  mid: { bg: "bg-orange-100", text: "text-orange-700" },
  late: { bg: "bg-red-100", text: "text-red-700" },
  legal: { bg: "bg-purple-100", text: "text-purple-700" },
};

export default function CollectionsPage() {
  const { data: rawCases, isLoading } = useCollectionsCases();
  const [stageFilter, setStageFilter] = useState<Stage>("all");
  const [search, setSearch] = useState("");

  const cases = useMemo(() => {
    return (rawCases ?? []).map((c: any) => ({
      id: c.id,
      borrower: `${c.borrowers?.first_name ?? ""} ${c.borrowers?.last_name ?? ""}`.trim() || "Unknown",
      loanRef: c.loans?.reference_number ?? "--",
      daysOverdue: c.loans?.days_overdue ?? 0,
      stage: c.stage ?? "early",
      amount: BigInt(c.loans?.outstanding_principal || 0),
      assignedTo: c.assigned_to ?? "--",
      nextAction: c.next_action_date ? new Date(c.next_action_date).toISOString().slice(0, 10) : "--",
    }));
  }, [rawCases]);

  const filtered = cases.filter((c: any) => {
    if (stageFilter !== "all" && c.stage !== stageFilter) return false;
    if (search && !c.borrower.toLowerCase().includes(search.toLowerCase()) && !c.loanRef.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Build aging buckets from the data
  const agingBuckets = useMemo(() => {
    const current = cases.filter((c: any) => c.daysOverdue < 30);
    const d30 = cases.filter((c: any) => c.daysOverdue >= 30 && c.daysOverdue < 60);
    const d60 = cases.filter((c: any) => c.daysOverdue >= 60 && c.daysOverdue < 90);
    const d90 = cases.filter((c: any) => c.daysOverdue >= 90);
    const total = cases.length || 1;

    return [
      { label: "Current", count: current.length, amount: current.reduce((s: bigint, c: any) => s + c.amount, 0n), color: "bg-emerald-500", pct: Math.round((current.length / total) * 100) },
      { label: "30 Days", count: d30.length, amount: d30.reduce((s: bigint, c: any) => s + c.amount, 0n), color: "bg-amber-400", pct: Math.round((d30.length / total) * 100) },
      { label: "60 Days", count: d60.length, amount: d60.reduce((s: bigint, c: any) => s + c.amount, 0n), color: "bg-orange-500", pct: Math.round((d60.length / total) * 100) },
      { label: "90+ Days", count: d90.length, amount: d90.reduce((s: bigint, c: any) => s + c.amount, 0n), color: "bg-red-500", pct: Math.round((d90.length / total) * 100) },
    ];
  }, [cases]);

  const totalOverdue = agingBuckets.reduce((sum, b) => sum + b.amount, 0n);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collections</h1>
          <p className="text-sm text-slate-500 mt-1">Delinquency dashboard and case management</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Collections</h1>
        <p className="text-sm text-slate-500 mt-1">Delinquency dashboard and case management</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {agingBuckets.map((b) => (
          <div key={b.label} className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-3 h-3 rounded-full", b.color)} />
              <span className="text-sm font-medium text-slate-600">{b.label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{b.count}</p>
            <p className="text-sm font-mono text-slate-500">{formatMoney(b.amount)}</p>
          </div>
        ))}
      </div>

      {/* Aging bar */}
      <div className="bg-white rounded-xl shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Aging Distribution</h2>
          <span className="text-sm font-mono text-slate-500">Total: {formatMoney(totalOverdue)}</span>
        </div>
        <div className="flex h-8 rounded-lg overflow-hidden">
          {agingBuckets.map((b) => (
            <div
              key={b.label}
              className={cn("flex items-center justify-center text-xs font-medium text-white transition-all", b.color)}
              style={{ width: `${Math.max(b.pct, 1)}%` }}
              title={`${b.label}: ${b.count} loans`}
            >
              {b.pct >= 10 && `${b.pct}%`}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {agingBuckets.map((b) => (
            <div key={b.label} className="flex items-center gap-1.5 text-xs text-slate-600">
              <div className={cn("w-2.5 h-2.5 rounded-full", b.color)} />
              {b.label} ({b.count})
            </div>
          ))}
        </div>
      </div>

      {/* Filters and cases table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search borrower or loan ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              {(["all", "early", "mid", "late", "legal"] as Stage[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStageFilter(s)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors",
                    stageFilter === s
                      ? "bg-sky-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Borrower</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Loan Ref</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Days Overdue</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Stage</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Assigned To</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Next Action</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c: any) => {
                const sc = stageColors[c.stage] ?? stageColors.early;
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{c.borrower}</td>
                    <td className="px-6 py-3.5 text-sm font-mono text-slate-600">{c.loanRef}</td>
                    <td className="px-6 py-3.5 text-sm font-mono text-right text-slate-900">{c.daysOverdue}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", sc.bg, sc.text)}>
                        {c.stage}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-mono text-right text-slate-900">{formatMoney(c.amount)}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">{c.assignedTo}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">{c.nextAction}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-sky-500 hover:text-sky-600">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-400">No cases match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
