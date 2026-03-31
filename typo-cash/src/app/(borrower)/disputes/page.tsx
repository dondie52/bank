"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/common/status-badge";
import { formatMoney } from "@/lib/money";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { useBorrower } from "@/hooks/use-borrower";
import { useMyLoans } from "@/hooks/use-loans";
import { useMyDisputes, useCreateDispute } from "@/hooks/use-disputes";
import { Plus, MessageSquare, Loader2 } from "lucide-react";
import { pulaToThebe } from "@/lib/money";

const categories = [
  { value: "billing_error", label: "Billing Error" },
  { value: "unauthorized_debit", label: "Unauthorized Debit" },
  { value: "incorrect_balance", label: "Incorrect Balance" },
  { value: "fee_dispute", label: "Fee Dispute" },
  { value: "service_complaint", label: "Service Complaint" },
  { value: "other", label: "Other" },
];

export default function DisputesPage() {
  const { borrower } = useBorrower();
  const { data: loans } = useMyLoans();
  const { data: disputes, isLoading } = useMyDisputes();
  const createDispute = useCreateDispute();

  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("billing_error");
  const [description, setDescription] = useState("");
  const [disputedAmount, setDisputedAmount] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrower || !selectedLoanId) return;

    await createDispute.mutateAsync({
      borrower_id: borrower.id,
      loan_id: selectedLoanId,
      category,
      description,
      disputed_amount: disputedAmount
        ? Number(pulaToThebe(parseFloat(disputedAmount)))
        : undefined,
    });

    setShowForm(false);
    setCategory("billing_error");
    setDescription("");
    setDisputedAmount("");
    setSelectedLoanId("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Disputes</h1>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Disputes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 h-9 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-5 space-y-4">
          <h3 className="font-semibold text-slate-900">Create Dispute</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Loan</label>
            <select
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a loan</option>
              {(loans ?? []).map((l: { id: string; reference_number: string }) => (
                <option key={l.id} value={l.id}>{l.reference_number}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Disputed Amount (Pula)</label>
            <input
              type="number"
              step="0.01"
              value={disputedAmount}
              onChange={(e) => setDisputedAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {createDispute.isError && (
            <p className="text-sm text-red-600">Failed to submit dispute. Please try again.</p>
          )}
          <button
            type="submit"
            disabled={createDispute.isPending}
            className="flex items-center justify-center gap-2 w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            {createDispute.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Dispute"}
          </button>
        </form>
      )}

      {!disputes || disputes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-8 text-center">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No disputes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d: { id: string; loans?: { reference_number: string }; status: string; description: string; category: string; disputed_amount?: number }) => (
            <div key={d.id} className="bg-white rounded-xl shadow-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">
                  {d.loans?.reference_number ?? "—"}
                </span>
                <StatusBadge status={d.status} />
              </div>
              <p className="text-sm font-medium text-slate-900">{d.description}</p>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>{d.category.replace(/_/g, " ")}</span>
                {d.disputed_amount != null && (
                  <span className="font-mono">
                    {formatMoney(BigInt(d.disputed_amount))}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
