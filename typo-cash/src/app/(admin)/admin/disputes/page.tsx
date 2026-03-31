"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type DisputeStatus = "open" | "investigating" | "resolved" | "rejected";

interface Dispute {
  id: string;
  borrower: string;
  loanRef: string;
  category: string;
  amount: bigint;
  status: DisputeStatus;
  slaDue: string;
  description: string;
  createdDate: string;
}

const disputes: Dispute[] = [
  { id: "DSP-001", borrower: "Mpho Kgosi", loanRef: "TC-202603-00045", category: "Incorrect Charge", amount: 12_500n, status: "open", slaDue: "2026-04-03", description: "Borrower disputes origination fee amount. Claims it should be P25, not P50.", createdDate: "2026-03-28" },
  { id: "DSP-002", borrower: "Naledi Tau", loanRef: "TC-202602-00001", category: "Payment Not Reflected", amount: 150_000n, status: "investigating", slaDue: "2026-04-02", description: "Payment of P1,500 made on 2026-03-20 not showing on account.", createdDate: "2026-03-25" },
  { id: "DSP-003", borrower: "Kagiso Ratsie", loanRef: "TC-202603-00018", category: "Interest Calculation", amount: 45_000n, status: "open", slaDue: "2026-04-05", description: "Disputes interest charged. Claims rate should be 15% not 18%.", createdDate: "2026-03-30" },
  { id: "DSP-004", borrower: "Boitumelo Segwabe", loanRef: "TC-202601-00009", category: "Unauthorized Deduction", amount: 80_000n, status: "resolved", slaDue: "2026-03-25", description: "Salary deduction made without signed deduction order.", createdDate: "2026-03-15" },
  { id: "DSP-005", borrower: "Lesego Marang", loanRef: "TC-202603-00051", category: "Incorrect Charge", amount: 5_000n, status: "rejected", slaDue: "2026-03-28", description: "Disputes late fee. Reviewed: payment was indeed late.", createdDate: "2026-03-20" },
  { id: "DSP-006", borrower: "Phenyo Tau", loanRef: "TC-202602-00060", category: "Payment Not Reflected", amount: 200_000n, status: "investigating", slaDue: "2026-04-04", description: "EFT transfer confirmation provided, but not credited.", createdDate: "2026-03-29" },
];

const statusColors: Record<DisputeStatus, { bg: string; text: string }> = {
  open: { bg: "bg-amber-100", text: "text-amber-700" },
  investigating: { bg: "bg-sky-100", text: "text-sky-700" },
  resolved: { bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { bg: "bg-slate-100", text: "text-slate-700" },
};

export default function DisputesPage() {
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});

  const filtered = disputes.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (search && !d.borrower.toLowerCase().includes(search.toLowerCase()) && !d.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Disputes</h1>
        <p className="text-sm text-slate-500 mt-1">Manage borrower disputes and complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          { label: "Open", count: disputes.filter((d) => d.status === "open").length, icon: AlertCircle, color: "bg-amber-100 text-amber-600" },
          { label: "Investigating", count: disputes.filter((d) => d.status === "investigating").length, icon: Clock, color: "bg-sky-100 text-sky-600" },
          { label: "Resolved", count: disputes.filter((d) => d.status === "resolved").length, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
          { label: "Rejected", count: disputes.filter((d) => d.status === "rejected").length, icon: XCircle, color: "bg-slate-100 text-slate-600" },
        ]).map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-card p-4">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2", s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.count}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by borrower or dispute ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              {(["all", "open", "investigating", "resolved", "rejected"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors",
                    statusFilter === s ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="divide-y divide-slate-100">
          {filtered.map((d) => {
            const sc = statusColors[d.status];
            const isExpanded = expandedId === d.id;

            return (
              <div key={d.id}>
                <button
                  onClick={() => toggle(d.id)}
                  className="w-full px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-4 items-center">
                    <span className="text-sm font-mono text-slate-900">{d.id}</span>
                    <span className="text-sm font-medium text-slate-900">{d.borrower}</span>
                    <span className="text-sm font-mono text-slate-600 hidden sm:block">{d.loanRef}</span>
                    <span className="text-sm text-slate-600 hidden sm:block">{d.category}</span>
                    <span className="text-sm font-mono text-slate-900 hidden sm:block">{formatMoney(d.amount)}</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", sc.bg, sc.text)}>
                        {d.status}
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:block">SLA: {d.slaDue}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-5 bg-slate-50 border-t border-slate-100">
                    <div className="pt-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Category</p>
                          <p className="font-medium text-slate-900">{d.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Amount Disputed</p>
                          <p className="font-mono font-medium text-slate-900">{formatMoney(d.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Created</p>
                          <p className="text-slate-900">{d.createdDate}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Description</p>
                        <p className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200">{d.description}</p>
                      </div>
                      {(d.status === "open" || d.status === "investigating") && (
                        <div className="space-y-2">
                          <textarea
                            value={resolutions[d.id] || ""}
                            onChange={(e) => setResolutions((prev) => ({ ...prev, [d.id]: e.target.value }))}
                            placeholder="Enter resolution details..."
                            rows={2}
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none bg-white"
                          />
                          <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                              <CheckCircle2 className="w-4 h-4" /> Resolve
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-slate-400">No disputes match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
