"use client";

import { useState } from "react";
import { useAuditLogs } from "@/hooks/use-admin";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Calendar,
} from "lucide-react";

const PAGE_SIZE = 20;

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [expandedJson, setExpandedJson] = useState<Set<string>>(new Set());

  const { data: result, isLoading } = useAuditLogs(page);
  const entries = result?.data ?? [];
  const totalCount = result?.count ?? 0;

  const toggleJson = (key: string) => {
    setExpandedJson((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Client-side search on the current page
  const filtered = entries.filter((entry: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (entry.actor ?? "").toLowerCase().includes(s) ||
      (entry.action ?? "").toLowerCase().includes(s) ||
      (entry.entity_type ?? "").toLowerCase().includes(s) ||
      (entry.entity_id ?? "").toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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

  if (isLoading) {
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
        <TableSkeleton rows={8} />
      </div>
    );
  }

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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
              {filtered.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 text-xs font-mono text-slate-600 whitespace-nowrap">
                    {entry.created_at ? new Date(entry.created_at).toLocaleString() : "--"}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-900">{entry.actor ?? "--"}</td>
                  <td className="px-6 py-3.5">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      entry.action === "CREATE" && "bg-emerald-100 text-emerald-700",
                      entry.action === "UPDATE" && "bg-sky-100 text-sky-700",
                      entry.action === "DELETE" && "bg-red-100 text-red-700",
                      entry.action === "DISBURSE" && "bg-violet-100 text-violet-700",
                      entry.action === "RESOLVE" && "bg-amber-100 text-amber-700",
                    )}>
                      {entry.action ?? "--"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-600">{entry.entity_type ?? "--"}</td>
                  <td className="px-6 py-3.5 text-sm font-mono text-slate-900">{entry.entity_id ?? "--"}</td>
                  <td className="px-6 py-3.5">{renderJson(`${entry.id}-old`, entry.old_value)}</td>
                  <td className="px-6 py-3.5">{renderJson(`${entry.id}-new`, entry.new_value)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
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
              Page {page + 1} of {totalPages} ({totalCount} total entries)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
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
