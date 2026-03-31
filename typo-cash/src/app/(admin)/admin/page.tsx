"use client";

import { formatMoney, formatMoneyShort } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { useAdminKPIs } from "@/hooks/use-admin";
import { useAllApplications } from "@/hooks/use-applications";
import { useKycQueue } from "@/hooks/use-admin";
import { useCollectionsCases } from "@/hooks/use-admin";
import { CardSkeleton, TableSkeleton } from "@/components/common/loading-skeleton";
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Users,
  FileText,
} from "lucide-react";

export default function AdminDashboard() {
  const { data: kpis, isLoading: kpisLoading } = useAdminKPIs();
  const { data: applications, isLoading: appsLoading } = useAllApplications();
  const { data: kycQueue, isLoading: kycLoading } = useKycQueue();
  const { data: collectionsCases, isLoading: collectionsLoading } = useCollectionsCases();

  const recentApplications = (applications ?? []).slice(0, 5);

  // Overdue loans from collections cases
  const overdueCases = (collectionsCases ?? []).slice(0, 5);

  const kpiCards = kpis
    ? [
        { label: "Active Loans", value: String(kpis.activeLoansCount), icon: Wallet, color: "bg-sky-100 text-primary" },
        { label: "Total Outstanding", value: formatMoney(BigInt(Math.round(kpis.totalOutstanding) || 0)), icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
        { label: "PAR 30+ Rate", value: `${kpis.par30.toFixed(1)}%`, icon: AlertTriangle, color: "bg-amber-100 text-amber-600" },
        { label: "Collection Rate", value: `${kpis.collectionRate.toFixed(1)}%`, icon: Users, color: "bg-violet-100 text-violet-600" },
        { label: "Pending Applications", value: String(kpis.pendingApplications), icon: FileText, color: "bg-red-100 text-red-600" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back, Admin</p>
      </div>

      {/* KPI cards */}
      {kpisLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent applications table */}
      {appsLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Recent Applications</h2>
            <a href="/admin/applications" className="text-sm text-primary font-medium hover:underline">
              View all
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Applicant</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                      No applications yet.
                    </td>
                  </tr>
                ) : (
                  recentApplications.map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => window.location.href = `/admin/applications/${app.id}`}>
                      <td className="px-6 py-3.5 text-sm font-medium text-slate-900">
                        {app.borrowers?.first_name} {app.borrowers?.last_name}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-600">{app.loan_products?.name ?? "--"}</td>
                      <td className="px-6 py-3.5 text-sm font-mono text-right text-slate-900">
                        {formatMoney(BigInt(app.requested_amount || 0))}
                      </td>
                      <td className="px-6 py-3.5"><StatusBadge status={app.status} /></td>
                      <td className="px-6 py-3.5 text-sm text-slate-500">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : "--"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Overdue Loans</h3>
          {collectionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : overdueCases.length === 0 ? (
            <p className="text-sm text-slate-500">No overdue loans.</p>
          ) : (
            <div className="space-y-2">
              {overdueCases.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      {item.borrowers?.first_name} {item.borrowers?.last_name}
                    </p>
                    <p className="text-xs text-red-700">
                      {item.loans?.reference_number ?? "--"} - {item.loans?.days_overdue ?? 0} day(s) overdue
                    </p>
                  </div>
                  <span className="text-sm font-mono font-medium text-red-900">
                    {formatMoney(BigInt(item.loans?.outstanding_principal || 0))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Pending KYC Reviews</h3>
          {kycLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (kycQueue ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">No pending KYC reviews.</p>
          ) : (
            <div className="space-y-2">
              {(kycQueue ?? []).slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {item.borrowers?.first_name} {item.borrowers?.last_name}
                    </p>
                    <p className="text-xs text-amber-700">Pending review</p>
                  </div>
                  <a href="/admin/kyc-review" className="text-xs font-medium text-primary hover:underline">
                    Review
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
