"use client";

import { useState, useMemo } from "react";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { useDisbursements } from "@/hooks/use-admin";
import { TableSkeleton, CardSkeleton } from "@/components/common/loading-skeleton";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Banknote,
  CheckCircle2,
  Clock,
} from "lucide-react";

type Tab = "pending" | "completed";

export default function DisbursementsPage() {
  const { data: rawDisbursements, isLoading } = useDisbursements();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("pending");
  const [approving, setApproving] = useState<Set<string>>(new Set());

  const disbursements = useMemo(() => {
    return (rawDisbursements ?? []).map((d: any) => ({
      id: d.id,
      ref: d.loans?.reference_number ?? "--",
      borrower: `${d.loans?.borrowers?.first_name ?? ""} ${d.loans?.borrowers?.last_name ?? ""}`.trim() || "Unknown",
      amount: BigInt(d.amount || 0),
      method: d.method ?? "EFT",
      status: d.status ?? "pending",
      date: d.initiated_at ? new Date(d.initiated_at).toISOString().slice(0, 10) : "--",
    }));
  }, [rawDisbursements]);

  const pendingDisbursements = disbursements.filter((d: any) => d.status === "pending");
  const completedDisbursements = disbursements.filter((d: any) => d.status !== "pending");

  const data = tab === "pending" ? pendingDisbursements : completedDisbursements;

  const handleApprove = async (id: string) => {
    setApproving((prev) => new Set(prev).add(id));
    const supabase = createClient();
    await supabase
      .from("disbursements")
      .update({ status: "disbursed" })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["disbursements"] });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Disbursements</h1>
          <p className="text-sm text-slate-500 mt-1">Queue and history of loan disbursements</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const pendingTotal = pendingDisbursements.reduce((s: bigint, d: any) => s + d.amount, 0n);
  const completedTotal = completedDisbursements.reduce((s: bigint, d: any) => s + d.amount, 0n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Disbursements</h1>
        <p className="text-sm text-slate-500 mt-1">Queue and history of loan disbursements</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{pendingDisbursements.length}</p>
          <p className="text-xs text-slate-500 mt-1">Pending Disbursements</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <Banknote className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900">
            {formatMoney(pendingTotal)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Pending Amount</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900">
            {formatMoney(completedTotal)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Disbursed Total</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="flex border-b border-slate-200">
          {([
            { key: "pending" as Tab, label: "Pending", icon: Clock, count: pendingDisbursements.length },
            { key: "completed" as Tab, label: "Completed", icon: CheckCircle2, count: completedDisbursements.length },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                tab === t.key
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                tab === t.key ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"
              )}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Reference</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Borrower</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Method</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Date</th>
                {tab === "pending" && (
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={tab === "pending" ? 7 : 6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No disbursements.
                  </td>
                </tr>
              ) : (
                data.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-mono text-slate-900">{d.ref}</td>
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{d.borrower}</td>
                    <td className="px-6 py-3.5 text-sm font-mono text-right text-slate-900">{formatMoney(d.amount)}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">{d.method}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={approving.has(d.id) ? "disbursed" : d.status} />
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">{d.date}</td>
                    {tab === "pending" && (
                      <td className="px-6 py-3.5 text-right">
                        {approving.has(d.id) ? (
                          <span className="text-xs text-emerald-600 font-medium">Approved</span>
                        ) : (
                          <button
                            onClick={() => handleApprove(d.id)}
                            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
