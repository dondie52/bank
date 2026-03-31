"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Calendar,
} from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}

const auditLog: AuditEntry[] = [
  { id: "AUD-001", timestamp: "2026-03-31 14:23:05", actor: "admin@typocash.co.bw", action: "UPDATE", entityType: "Loan", entityId: "TC-202603-00045", oldValue: { status: "active" }, newValue: { status: "overdue" } },
  { id: "AUD-002", timestamp: "2026-03-31 13:45:12", actor: "system", action: "CREATE", entityType: "ComplianceFlag", entityId: "FLG-001", oldValue: null, newValue: { flagType: "AML", severity: "critical", entityId: "BRW-00123" } },
  { id: "AUD-003", timestamp: "2026-03-31 12:10:33", actor: "kagiso@typocash.co.bw", action: "UPDATE", entityType: "KYC", entityId: "KYC-001", oldValue: { status: "pending" }, newValue: { status: "approved" } },
  { id: "AUD-004", timestamp: "2026-03-31 11:02:18", actor: "admin@typocash.co.bw", action: "DISBURSE", entityType: "Loan", entityId: "TC-202603-00050", oldValue: { status: "cooling_off" }, newValue: { status: "active", disbursedAt: "2026-03-31T11:02:18Z" } },
  { id: "AUD-005", timestamp: "2026-03-30 16:45:00", actor: "lerato@typocash.co.bw", action: "UPDATE", entityType: "Collection", entityId: "COL-002", oldValue: { stage: "early" }, newValue: { stage: "mid" } },
  { id: "AUD-006", timestamp: "2026-03-30 15:30:22", actor: "system", action: "CREATE", entityType: "Dispute", entityId: "DSP-003", oldValue: null, newValue: { category: "Interest Calculation", status: "open" } },
  { id: "AUD-007", timestamp: "2026-03-30 14:12:45", actor: "admin@typocash.co.bw", action: "UPDATE", entityType: "User", entityId: "USR-005", oldValue: { role: "agent" }, newValue: { role: "manager" } },
  { id: "AUD-008", timestamp: "2026-03-30 10:05:11", actor: "mpho@typocash.co.bw", action: "RESOLVE", entityType: "ComplianceFlag", entityId: "FLG-006", oldValue: { resolved: false }, newValue: { resolved: true } },
  { id: "AUD-009", timestamp: "2026-03-29 17:22:33", actor: "system", action: "CREATE", entityType: "Loan", entityId: "TC-202603-00078", oldValue: null, newValue: { borrower: "Naledi Tau", amount: 200000, product: "Emergency" } },
  { id: "AUD-010", timestamp: "2026-03-29 15:10:00", actor: "admin@typocash.co.bw", action: "DELETE", entityType: "NotificationTemplate", entityId: "TPL-003", oldValue: { code: "payment_reminder_v1", channel: "sms" }, newValue: null },
  { id: "AUD-011", timestamp: "2026-03-29 11:44:55", actor: "kagiso@typocash.co.bw", action: "UPDATE", entityType: "Borrower", entityId: "BRW-00156", oldValue: { phone: "+267 71 000 000" }, newValue: { phone: "+267 71 234 567" } },
  { id: "AUD-012", timestamp: "2026-03-28 09:30:00", actor: "system", action: "CREATE", entityType: "ComplianceFlag", entityId: "FLG-003", oldValue: null, newValue: { flagType: "AML", severity: "medium" } },
];

const PAGE_SIZE = 8;

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [expandedJson, setExpandedJson] = useState<Set<string>>(new Set());

  const toggleJson = (key: string) => {
    setExpandedJson((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = auditLog.filter((entry) => {
    if (search) {
      const s = search.toLowerCase();
      if (
        !entry.actor.toLowerCase().includes(s) &&
        !entry.action.toLowerCase().includes(s) &&
        !entry.entityType.toLowerCase().includes(s) &&
        !entry.entityId.toLowerCase().includes(s)
      ) return false;
    }
    if (dateFrom && entry.timestamp < dateFrom) return false;
    if (dateTo && entry.timestamp > dateTo + " 23:59:59") return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const renderJson = (key: string, data: Record<string, unknown> | null) => {
    if (!data) return <span className="text-xs text-slate-400">&mdash;</span>;
    const isExpanded = expandedJson.has(key);
    return (
      <button
        onClick={() => toggleJson(key)}
        className="text-left"
      >
        {isExpanded ? (
          <pre className="text-xs font-mono bg-slate-50 p-2 rounded text-slate-700 max-w-[200px] overflow-auto whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-sky-600 hover:text-sky-700">
            {`{${Object.keys(data).length} keys}`}
            <ChevronDown className="w-3 h-3" />
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin/compliance" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">Searchable record of all system actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by actor, action, or entity..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Timestamp</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Actor</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Action</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Entity Type</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Entity ID</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Old Value</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">New Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 text-xs font-mono text-slate-600 whitespace-nowrap">{entry.timestamp}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-900">{entry.actor}</td>
                  <td className="px-6 py-3.5">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      entry.action === "CREATE" && "bg-emerald-100 text-emerald-700",
                      entry.action === "UPDATE" && "bg-sky-100 text-sky-700",
                      entry.action === "DELETE" && "bg-red-100 text-red-700",
                      entry.action === "DISBURSE" && "bg-violet-100 text-violet-700",
                      entry.action === "RESOLVE" && "bg-amber-100 text-amber-700",
                    )}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-600">{entry.entityType}</td>
                  <td className="px-6 py-3.5 text-sm font-mono text-slate-900">{entry.entityId}</td>
                  <td className="px-6 py-3.5">{renderJson(`${entry.id}-old`, entry.oldValue)}</td>
                  <td className="px-6 py-3.5">{renderJson(`${entry.id}-new`, entry.newValue)}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">No audit entries match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={cn(
                    "w-8 h-8 text-xs font-medium rounded-lg transition-colors",
                    page === i ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
