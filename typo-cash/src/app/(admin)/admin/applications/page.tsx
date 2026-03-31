"use client";

import { useState, useMemo } from "react";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { useAllApplications } from "@/hooks/use-applications";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Clock,
  FileText,
} from "lucide-react";

type SortField = "applicant" | "product" | "amount" | "riskScore" | "sla" | "status";
type SortDir = "asc" | "desc";
type FilterTab = "all" | "submitted" | "approved" | "declined";

function formatSla(minutes: number): string {
  if (minutes <= 0) return "--";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function slaColor(minutes: number): string {
  if (minutes <= 0) return "text-slate-400";
  if (minutes <= 60) return "text-red-600";
  if (minutes <= 180) return "text-amber-600";
  return "text-emerald-600";
}

function riskColor(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-700";
  if (score >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "declined", label: "Declined" },
];

export default function ApplicationsPage() {
  const { data: rawApplications, isLoading } = useAllApplications();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sortField, setSortField] = useState<SortField>("sla");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Map DB rows to the shape the UI expects
  const applications = useMemo(() => {
    return (rawApplications ?? []).map((app: any) => {
      const createdAt = app.created_at ? new Date(app.created_at) : null;
      const slaMinutes = createdAt
        ? Math.max(0, Math.round((Date.now() - createdAt.getTime()) / 60000))
        : 0;
      return {
        id: app.id,
        applicant: `${app.borrowers?.first_name ?? ""} ${app.borrowers?.last_name ?? ""}`.trim() || "Unknown",
        product: app.loan_products?.name ?? "--",
        amount: BigInt(app.requested_amount || 0),
        riskScore: app.risk_score ?? 0,
        slaMinutes: ["submitted", "under_review"].includes(app.status) ? slaMinutes : 0,
        status: app.status,
        date: createdAt ? createdAt.toISOString().slice(0, 10) : "--",
      };
    });
  }, [rawApplications]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let list = applications;

    if (filter !== "all") {
      list = list.filter((a: any) => a.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a: any) =>
          a.applicant.toLowerCase().includes(q) ||
          a.product.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }

    const sorted = [...list].sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortField) {
        case "applicant": cmp = a.applicant.localeCompare(b.applicant); break;
        case "product": cmp = a.product.localeCompare(b.product); break;
        case "amount": cmp = Number(a.amount - b.amount); break;
        case "riskScore": cmp = a.riskScore - b.riskScore; break;
        case "sla": cmp = a.slaMinutes - b.slaMinutes; break;
        case "status": cmp = a.status.localeCompare(b.status); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [applications, search, filter, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp className={cn("w-3 h-3 -mb-1", sortField === field && sortDir === "asc" ? "text-primary" : "text-slate-300")} />
      <ChevronDown className={cn("w-3 h-3", sortField === field && sortDir === "desc" ? "text-primary" : "text-slate-300")} />
    </span>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications Queue</h1>
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
            <span className="text-slate-900 font-medium">Applications</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Applications Queue</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileText className="w-4 h-4" />
          <span>{filtered.length} application{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                  filter === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, product, or ID..."
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
                {([
                  { field: "applicant" as SortField, label: "Applicant", align: "text-left" },
                  { field: "product" as SortField, label: "Product", align: "text-left" },
                  { field: "amount" as SortField, label: "Amount", align: "text-right" },
                  { field: "riskScore" as SortField, label: "Risk Score", align: "text-center" },
                  { field: "sla" as SortField, label: "SLA Countdown", align: "text-center" },
                  { field: "status" as SortField, label: "Status", align: "text-left" },
                ]).map((col) => (
                  <th
                    key={col.field}
                    onClick={() => toggleSort(col.field)}
                    className={cn(
                      "px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none",
                      col.align
                    )}
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((app: any) => (
                <tr
                  key={app.id}
                  onClick={() => (window.location.href = `/admin/applications/${app.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{app.applicant}</p>
                      <p className="text-xs text-slate-500">{app.id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-600">{app.product}</td>
                  <td className="px-6 py-3.5 text-sm font-mono text-right text-slate-900">
                    {formatMoney(app.amount)}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold",
                        riskColor(app.riskScore)
                      )}
                    >
                      {app.riskScore}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={cn("inline-flex items-center gap-1 text-sm font-medium", slaColor(app.slaMinutes))}>
                      {app.slaMinutes > 0 && <Clock className="w-3.5 h-3.5" />}
                      {formatSla(app.slaMinutes)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={app.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No applications match your filters.
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
