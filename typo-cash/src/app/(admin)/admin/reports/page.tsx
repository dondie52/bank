"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FileBarChart,
  Calendar,
  Download,
  FileText,
  Loader2,
  BarChart3,
} from "lucide-react";

const reportTypes = [
  { id: "portfolio-summary", name: "Portfolio Summary", description: "Overview of all active loans, amounts, and performance metrics" },
  { id: "delinquency-aging", name: "Delinquency Aging", description: "Aging analysis of overdue loans by bucket (30/60/90+ days)" },
  { id: "disbursements", name: "Disbursements", description: "All loan disbursements with amounts, methods, and dates" },
  { id: "nbfira-form-6", name: "NBFIRA Form 6", description: "Quarterly regulatory return — Statement of Financial Position" },
  { id: "nbfira-form-7", name: "NBFIRA Form 7", description: "Quarterly regulatory return — Income and Expenditure Statement" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(reportTypes[0].id);
  const [dateFrom, setDateFrom] = useState("2026-03-01");
  const [dateTo, setDateTo] = useState("2026-03-31");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1500);
  };

  const selected = reportTypes.find((r) => r.id === selectedReport)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate and export operational and regulatory reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report selection */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Report Type</h2>
          <div className="space-y-2">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => { setSelectedReport(report.id); setGenerated(false); }}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all",
                  selectedReport === report.id
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    selectedReport === report.id ? "bg-sky-100" : "bg-slate-100"
                  )}>
                    <FileBarChart className={cn("w-4 h-4", selectedReport === report.id ? "text-sky-600" : "text-slate-400")} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", selectedReport === report.id ? "text-sky-700" : "text-slate-900")}>
                      {report.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{report.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration and results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Config */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-semibold text-slate-900 mb-4">{selected.name}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Date From</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Date To</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
                {generating ? "Generating..." : "Generate Report"}
              </button>
              {generated && (
                <>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
                    <FileText className="w-4 h-4" /> Export PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Results area */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Results</h3>
            {!generated && !generating ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <FileBarChart className="w-12 h-12 mb-3" />
                <p className="text-sm">Select a report type and date range, then click Generate.</p>
              </div>
            ) : generating ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-3 text-sky-500" />
                <p className="text-sm text-slate-500">Generating report...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Records", value: "342" },
                    { label: "Total Amount", value: "P2,450,000" },
                    { label: "Period", value: `${dateFrom} to ${dateTo}` },
                    { label: "Generated", value: new Date().toLocaleTimeString() },
                  ].map((item) => (
                    <div key={item.label} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-medium font-mono text-slate-900 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Placeholder chart area */}
                <div className="h-48 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <BarChart3 className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">Chart visualization placeholder</p>
                  </div>
                </div>

                {/* Placeholder table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-2">Category</th>
                        <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider py-2">Count</th>
                        <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider py-2">Amount</th>
                        <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider py-2">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { cat: "Quick Cash", count: 145, amount: "P725,000", pct: "29.6%" },
                        { cat: "Emergency Loan", count: 89, amount: "P445,000", pct: "18.2%" },
                        { cat: "Instalment Loan", count: 72, amount: "P840,000", pct: "34.3%" },
                        { cat: "Salary-Backed", count: 36, amount: "P440,000", pct: "18.0%" },
                      ].map((row) => (
                        <tr key={row.cat} className="hover:bg-slate-50">
                          <td className="py-2.5 text-sm text-slate-900">{row.cat}</td>
                          <td className="py-2.5 text-sm font-mono text-right text-slate-900">{row.count}</td>
                          <td className="py-2.5 text-sm font-mono text-right text-slate-900">{row.amount}</td>
                          <td className="py-2.5 text-sm font-mono text-right text-slate-500">{row.pct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
