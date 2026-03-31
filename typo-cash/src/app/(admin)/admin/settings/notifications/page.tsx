"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Smartphone,
  Pencil,
} from "lucide-react";

interface NotificationTemplate {
  id: string;
  code: string;
  channel: "sms" | "email" | "push";
  subject: string;
  preview: string;
  active: boolean;
}

const channelIcons = {
  sms: MessageSquare,
  email: Mail,
  push: Smartphone,
};

const channelColors = {
  sms: "bg-emerald-100 text-emerald-600",
  email: "bg-sky-100 text-sky-600",
  push: "bg-violet-100 text-violet-600",
};

const initialTemplates: NotificationTemplate[] = [
  { id: "TPL-001", code: "loan_approved", channel: "sms", subject: "Loan Approved", preview: "Congratulations! Your loan of {amount} has been approved.", active: true },
  { id: "TPL-002", code: "loan_approved", channel: "email", subject: "Your Loan Application Has Been Approved", preview: "Dear {name}, we are pleased to inform you that your loan application...", active: true },
  { id: "TPL-003", code: "payment_reminder", channel: "sms", subject: "Payment Reminder", preview: "Reminder: Your payment of {amount} for loan {ref} is due on {date}.", active: true },
  { id: "TPL-004", code: "payment_reminder", channel: "email", subject: "Upcoming Payment Reminder", preview: "Dear {name}, this is a friendly reminder that your upcoming payment...", active: true },
  { id: "TPL-005", code: "payment_received", channel: "sms", subject: "Payment Received", preview: "Thank you! We received your payment of {amount} for loan {ref}.", active: true },
  { id: "TPL-006", code: "overdue_notice", channel: "sms", subject: "Overdue Notice", preview: "Your payment for loan {ref} is {days} days overdue. Please pay {amount}.", active: true },
  { id: "TPL-007", code: "overdue_notice", channel: "email", subject: "Important: Loan Payment Overdue", preview: "Dear {name}, your loan payment is now overdue by {days} days...", active: true },
  { id: "TPL-008", code: "kyc_required", channel: "email", subject: "Document Verification Required", preview: "Dear {name}, please upload your identity documents to complete...", active: true },
  { id: "TPL-009", code: "disbursement_complete", channel: "sms", subject: "Funds Disbursed", preview: "Your loan of {amount} has been disbursed to your account ending {last4}.", active: true },
  { id: "TPL-010", code: "cooling_off_reminder", channel: "push", subject: "Cooling-Off Period Active", preview: "You have 48 hours to cancel your loan application at no cost.", active: true },
];

export default function NotificationsSettingsPage() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleActive = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin/settings" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notification Templates</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage notification messages and channels</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["sms", "email", "push"] as const).map((channel) => {
          const Icon = channelIcons[channel];
          const count = templates.filter((t) => t.channel === channel).length;
          return (
            <div key={channel} className="bg-white rounded-xl shadow-card p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", channelColors[channel])}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500 capitalize">{channel} Templates</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template list */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Code</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Channel</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Subject</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Preview</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Active</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {templates.map((t) => {
                const Icon = channelIcons[t.channel];
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-mono text-slate-900">{t.code}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", channelColors[t.channel])}>
                        <Icon className="w-3 h-3" />
                        {t.channel}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{t.subject}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500 max-w-xs truncate">{t.preview}</td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => toggleActive(t.id)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          t.active ? "bg-sky-500" : "bg-slate-300"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            t.active ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setEditingId(editingId === t.id ? null : t.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-sky-500"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit placeholder */}
      {editingId && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Edit Template: {templates.find((t) => t.id === editingId)?.code}</h3>
            <button onClick={() => setEditingId(null)} className="text-xs text-slate-500 hover:text-slate-700">Close</button>
          </div>
          <div className="h-32 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
            <p className="text-sm text-slate-400">Template editor placeholder - rich text editing would go here</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors">
              Save Changes
            </button>
            <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
