"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Shield,
  Bug,
  FileWarning,
  CheckCircle2,
  Search,
} from "lucide-react";

type Severity = "critical" | "high" | "medium" | "low";

interface ComplianceFlag {
  id: string;
  entityType: string;
  entityId: string;
  flagType: string;
  severity: Severity;
  description: string;
  createdDate: string;
  resolved: boolean;
}

const flags: ComplianceFlag[] = [
  { id: "FLG-001", entityType: "Borrower", entityId: "BRW-00123", flagType: "AML", severity: "critical", description: "Transaction pattern matches structuring behavior. Multiple deposits just under reporting threshold.", createdDate: "2026-03-30", resolved: false },
  { id: "FLG-002", entityType: "Loan", entityId: "TC-202603-00045", flagType: "Fraud", severity: "high", description: "Payslip employer details do not match BURS records.", createdDate: "2026-03-29", resolved: false },
  { id: "FLG-003", entityType: "Borrower", entityId: "BRW-00089", flagType: "AML", severity: "medium", description: "PEP match detected during screening. Manual review required.", createdDate: "2026-03-28", resolved: false },
  { id: "FLG-004", entityType: "Loan", entityId: "TC-202603-00032", flagType: "Compliance", severity: "low", description: "Cooling-off period disclosure not acknowledged by borrower.", createdDate: "2026-03-27", resolved: false },
  { id: "FLG-005", entityType: "Borrower", entityId: "BRW-00156", flagType: "Fraud", severity: "high", description: "Duplicate Omang detected across two applications.", createdDate: "2026-03-26", resolved: false },
  { id: "FLG-006", entityType: "Loan", entityId: "TC-202602-00018", flagType: "Compliance", severity: "medium", description: "Interest rate exceeds NBFIRA guideline for product type.", createdDate: "2026-03-25", resolved: true },
  { id: "FLG-007", entityType: "Borrower", entityId: "BRW-00201", flagType: "AML", severity: "critical", description: "Borrower appears on international sanctions list.", createdDate: "2026-03-24", resolved: false },
];

const severityColors: Record<Severity, { bg: string; text: string; dot: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  high: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  low: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" },
};

export default function CompliancePage() {
  const [resolvedFlags, setResolvedFlags] = useState<Set<string>>(
    new Set(flags.filter((f) => f.resolved).map((f) => f.id))
  );
  const [search, setSearch] = useState("");

  const handleResolve = (id: string) => {
    setResolvedFlags((prev) => new Set(prev).add(id));
  };

  const unresolvedFlags = flags.filter((f) => !resolvedFlags.has(f.id));
  const amlCount = unresolvedFlags.filter((f) => f.flagType === "AML").length;
  const fraudCount = unresolvedFlags.filter((f) => f.flagType === "Fraud").length;
  const complianceCount = unresolvedFlags.filter((f) => f.flagType === "Compliance").length;

  const filtered = flags.filter((f) => {
    if (search && !f.entityId.toLowerCase().includes(search.toLowerCase()) && !f.description.toLowerCase().includes(search.toLowerCase()) && !f.flagType.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
              {filtered.map((f) => {
                const sc = severityColors[f.severity];
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
