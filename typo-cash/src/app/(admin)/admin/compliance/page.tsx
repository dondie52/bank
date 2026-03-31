"use client";

import { useState, useMemo } from "react";
import { useComplianceFlags } from "@/hooks/use-admin";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { TableSkeleton, CardSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/lib/utils";
import {
  Shield,
  Bug,
  FileWarning,
  CheckCircle2,
  Search,
} from "lucide-react";

type Severity = "critical" | "high" | "medium" | "low";

const severityColors: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  high: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  low: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" },
};

export default function CompliancePage() {
  const { data: rawFlags, isLoading } = useComplianceFlags();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [resolvedLocally, setResolvedLocally] = useState<Set<string>>(new Set());

  const flags = useMemo(() => {
    return (rawFlags ?? []).map((f: any) => ({
      id: f.id,
      entityType: f.entity_type ?? "--",
      entityId: f.entity_id ?? "--",
      flagType: f.flag_type ?? "--",
      severity: (f.severity ?? "low") as Severity,
      description: f.description ?? "",
      createdDate: f.created_at ? new Date(f.created_at).toISOString().slice(0, 10) : "--",
      resolved: f.resolved ?? false,
    }));
  }, [rawFlags]);

  const resolvedFlags = useMemo(() => {
    const set = new Set(flags.filter((f: any) => f.resolved).map((f: any) => f.id));
    resolvedLocally.forEach((id) => set.add(id));
    return set;
  }, [flags, resolvedLocally]);

  const handleResolve = async (id: string) => {
    setResolvedLocally((prev) => new Set(prev).add(id));
    const supabase = createClient();
    await supabase
      .from("compliance_flags")
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["compliance-flags"] });
  };

  const unresolvedFlags = flags.filter((f: any) => !resolvedFlags.has(f.id));
  const amlCount = unresolvedFlags.filter((f: any) => f.flagType === "AML").length;
  const fraudCount = unresolvedFlags.filter((f: any) => f.flagType === "Fraud").length;
  const complianceCount = unresolvedFlags.filter((f: any) => f.flagType === "Compliance").length;

  const filtered = flags.filter((f: any) => {
    if (search && !f.entityId.toLowerCase().includes(search.toLowerCase()) && !f.description.toLowerCase().includes(search.toLowerCase()) && !f.flagType.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance</h1>
          <p className="text-sm text-slate-500 mt-1">Compliance flags and monitoring dashboard</p>
        </div>
        <a href="/admin/compliance/audit-log" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
          Audit Log
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{amlCount}</p>
              <p className="text-xs text-slate-500">AML Flags</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bug className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{fraudCount}</p>
              <p className="text-xs text-slate-500">Fraud Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{complianceCount}</p>
              <p className="text-xs text-slate-500">Compliance Issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flag list */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search flags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Entity Type</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Entity ID</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Flag Type</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Severity</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Description</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Created</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">No compliance flags found.</td>
                </tr>
              ) : (
                filtered.map((f: any) => {
                  const sc = severityColors[f.severity] ?? severityColors.low;
                  const isResolved = resolvedFlags.has(f.id);

                  return (
                    <tr key={f.id} className={cn("transition-colors", isResolved ? "opacity-50" : "hover:bg-slate-50")}>
                      <td className="px-6 py-3.5 text-sm text-slate-600">{f.entityType}</td>
                      <td className="px-6 py-3.5 text-sm font-mono text-slate-900">{f.entityId}</td>
                      <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{f.flagType}</td>
                      <td className="px-6 py-3.5">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", sc.bg, sc.text)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                          {f.severity}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-600 max-w-xs truncate">{f.description}</td>
                      <td className="px-6 py-3.5 text-sm text-slate-500">{f.createdDate}</td>
                      <td className="px-6 py-3.5 text-right">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleResolve(f.id)}
                            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
