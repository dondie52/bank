"use client";

import { useState, useMemo } from "react";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { useAllLoans } from "@/hooks/use-loans";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/lib/utils";
import { Search, Wallet, Filter } from "lucide-react";

type LoanFilter = "all" | "active" | "overdue" | "collections" | "restructured" | "closed";

const filterTabs: { key: LoanFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "overdue", label: "Overdue" },
  { key: "collections", label: "Collections" },
  { key: "restructured", label: "Restructured" },
  { key: "closed", label: "Closed" },
];

export default function LoansPage() {
  const { data: rawLoans, isLoading } = useAllLoans();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LoanFilter>("all");

  const loans = useMemo(() => {
    return (rawLoans ?? []).map((l: any) => ({
      id: l.reference_number ?? l.id,
      realId: l.id,
      borrower: `${l.borrowers?.first_name ?? ""} ${l.borrowers?.last_name ?? ""}`.trim() || "Unknown",
      product: l.loan_products?.name ?? "--",
      amount: BigInt(l.principal_amount || 0),
      outstanding: BigInt(l.outstanding_principal || 0),
      status: l.status ?? "unknown",
      daysOverdue: l.days_overdue ?? 0,
    }));
  }, [rawLoans]);

  const filtered = useMemo(() => {
    let list = loans;

    if (filter !== "all") {
      list = list.filter((l: any) => l.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l: any) =>
          l.borrower.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          l.product.toLowerCase().includes(q)
      );
    }

    return list;
  }, [loans, search, filter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loans</h1>
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
            <span className="text-slate-900 font-medium">Loans</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Loans</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Wallet className="w-4 h-4" />
          <span>{filtered.length} loan{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-slate-400 mr-1" />
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    filter === tab.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by reference, borrower, or product..."
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
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Reference</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Borrower</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Product</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Outstanding</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Days Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((loan: any) => (
                <tr
                  key={loan.realId}
                  onClick={() => (window.location.href = `/admin/loans/${loan.realId}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3.5 text-sm font-mono text-slate-900">{loan.id}</td>
                  <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{loan.borrower}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-600">{loan.product}</td>
                  <td className="px-6 py-3.5 text-sm font-mono text-right text-slate-900">{formatMoney(loan.amount)}</td>
                  <td className="px-6 py-3.5 text-sm font-mono text-right text-slate-900">{formatMoney(loan.outstanding)}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={loan.status} /></td>
                  <td className="px-6 py-3.5 text-center">
                    {loan.daysOverdue > 0 ? (
                      <span className={cn(
                        "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold",
                        loan.daysOverdue >= 30 ? "bg-red-100 text-red-700" :
                        loan.daysOverdue >= 7 ? "bg-amber-100 text-amber-700" :
                        "bg-orange-100 text-orange-700"
                      )}>
                        {loan.daysOverdue}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">--</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No loans match your filters.
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
