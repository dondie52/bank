"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/common/status-badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Clock,
  Send,
  RefreshCcw,
} from "lucide-react";

const borrowerInfo = {
  name: "Kelebogile Pule",
  omang: "****5678",
  phone: "+267 71 234 567",
  email: "k.pule@email.com",
  employer: "Debswana Mining",
};

const loanDetails = {
  ref: "TC-202602-00018",
  product: "Instalment Loan",
  principal: 340_000n,
  outstanding: 385_200n,
  interestRate: "18%",
  termDays: 90,
  disbursedDate: "2026-02-01",
  dueDate: "2026-05-02",
  daysOverdue: 35,
  stage: "mid",
  status: "overdue",
};

const actionLog = [
  { id: 1, date: "2026-03-25", actor: "Kagiso R.", type: "sms", note: "Sent first reminder SMS." },
  { id: 2, date: "2026-03-20", actor: "System", type: "auto", note: "Loan moved to collections - 30 days overdue." },
  { id: 3, date: "2026-03-15", actor: "Kagiso R.", type: "call", note: "Called borrower - no answer. Left voicemail." },
  { id: 4, date: "2026-03-10", actor: "System", type: "auto", note: "Payment reminder sent - 5 days before due." },
  { id: 5, date: "2026-03-01", actor: "System", type: "auto", note: "Loan marked overdue." },
];

const typeIcons: Record<string, typeof Phone> = {
  call: Phone,
  sms: MessageSquare,
  auto: Clock,
  email: Mail,
  note: FileText,
};

export default function CaseDetailPage() {
  const [contactNote, setContactNote] = useState("");
  const [restructureTerm, setRestructureTerm] = useState("");
  const [restructureAmount, setRestructureAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleAddNote = () => {
    if (!contactNote.trim()) return;
    setSubmitted(true);
    setContactNote("");
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin/collections" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Case: {loanDetails.ref}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{borrowerInfo.name} &mdash; {loanDetails.daysOverdue} days overdue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Borrower info */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-sky-500" /> Borrower Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name", value: borrowerInfo.name },
                { label: "Omang", value: borrowerInfo.omang },
                { label: "Phone", value: borrowerInfo.phone },
                { label: "Email", value: borrowerInfo.email },
                { label: "Employer", value: borrowerInfo.employer },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-medium text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Loan details */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-500" /> Loan Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Reference", value: loanDetails.ref },
                { label: "Product", value: loanDetails.product },
                { label: "Principal", value: formatMoney(loanDetails.principal), mono: true },
                { label: "Outstanding", value: formatMoney(loanDetails.outstanding), mono: true },
                { label: "Interest Rate", value: loanDetails.interestRate },
                { label: "Term", value: `${loanDetails.termDays} days` },
                { label: "Disbursed", value: loanDetails.disbursedDate },
                { label: "Due Date", value: loanDetails.dueDate },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className={cn("text-sm font-medium text-slate-900", (item as { mono?: boolean }).mono && "font-mono")}>{item.value}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <StatusBadge status={loanDetails.status} className="mt-0.5" />
              </div>
            </div>
          </div>

          {/* Action timeline */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500" /> Action Log
            </h2>
            <div className="space-y-4">
              {actionLog.map((entry, i) => {
                const Icon = typeIcons[entry.type] || FileText;
                return (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-sky-600" />
                      </div>
                      {i < actionLog.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-slate-900">{entry.note}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{entry.date} &mdash; {entry.actor}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Add contact note */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-500" /> Add Contact Note
            </h2>
            <textarea
              value={contactNote}
              onChange={(e) => setContactNote(e.target.value)}
              placeholder="Describe the contact attempt or action taken..."
              rows={4}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            />
            <button
              onClick={handleAddNote}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" /> Submit Note
            </button>
            {submitted && (
              <p className="text-xs text-emerald-600 mt-2 text-center">Note added successfully.</p>
            )}
          </div>

          {/* Restructuring option */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-sky-500" /> Restructure Loan
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">New Term (days)</label>
                <input
                  type="number"
                  value={restructureTerm}
                  onChange={(e) => setRestructureTerm(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">New Monthly Amount (Pula)</label>
                <input
                  type="number"
                  value={restructureAmount}
                  onChange={(e) => setRestructureAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                Propose Restructure
              </button>
            </div>
          </div>

          {/* Demand letter */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-500" /> Demand Letter
            </h2>
            <p className="text-xs text-slate-500 mb-3">Generate and send a formal demand letter to the borrower.</p>
            <button className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> Generate Demand Letter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
