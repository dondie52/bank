"use client";

import { useState } from "react";
import { useKycQueue } from "@/hooks/use-admin";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/lib/utils";
import {
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  Image,
} from "lucide-react";

export default function KycReviewPage() {
  const { data: rawQueue, isLoading } = useKycQueue();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});

  const kycQueue = (rawQueue ?? []).map((item: any) => ({
    id: item.id,
    borrowerId: item.borrower_id,
    name: `${item.borrowers?.first_name ?? ""} ${item.borrowers?.last_name ?? ""}`.trim() || "Unknown",
    submittedDate: item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : "--",
    documents: (item.borrowers?.documents ?? []).map((d: any) => ({
      name: d.document_type ?? "Document",
      type: d.document_type ?? "unknown",
    })),
    documentCount: item.borrowers?.documents?.length ?? 0,
    ocrScore: item.ocr_confidence ?? 0,
  }));

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDecision = async (id: string, decision: "approved" | "rejected") => {
    setDecisions((prev) => ({ ...prev, [id]: decision }));
    setExpandedId(null);

    const supabase = createClient();
    await supabase
      .from("kyc_profiles")
      .update({
        verification_status: decision,
        reviewed_at: new Date().toISOString(),
        review_notes: notes[id] || null,
      })
      .eq("id", id);

    queryClient.invalidateQueries({ queryKey: ["kyc-queue"] });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KYC Review</h1>
          <p className="text-sm text-slate-500 mt-1">Pending identity verification reviews</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">KYC Review</h1>
        <p className="text-sm text-slate-500 mt-1">Pending identity verification reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{kycQueue.filter((k: any) => !decisions[k.id]).length}</p>
          <p className="text-xs text-slate-500 mt-1">Pending Reviews</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {Object.values(decisions).filter((d) => d === "approved").length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Approved Today</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {Object.values(decisions).filter((d) => d === "rejected").length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Rejected Today</p>
        </div>
      </div>

      {/* Queue */}
      {kycQueue.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-8 text-center text-sm text-slate-500">
          No pending KYC reviews.
        </div>
      ) : (
        <div className="space-y-3">
          {kycQueue.map((item: any) => {
            const isExpanded = expandedId === item.id;
            const decision = decisions[item.id];

            return (
              <div key={item.id} className="bg-white rounded-xl shadow-card overflow-hidden">
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">Submitted {item.submittedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-500">{item.documentCount} documents</p>
                    </div>
                    {decision ? (
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                        decision === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {decision}
                      </span>
                    ) : (
                      isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && !decision && (
                  <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                    {/* Document thumbnails */}
                    <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Documents</h3>
                    {item.documents.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {item.documents.map((doc: any, idx: number) => (
                          <div key={idx} className="border border-slate-200 rounded-lg p-3 flex flex-col items-center gap-2">
                            <div className="w-full h-20 bg-slate-100 rounded flex items-center justify-center">
                              {/* eslint-disable-next-line jsx-a11y/alt-text */}
                              <Image className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-xs text-slate-600 text-center">{doc.name}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mb-4">No documents uploaded.</p>
                    )}

                    {/* OCR score */}
                    {item.ocrScore > 0 && (
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs text-slate-500">OCR Confidence:</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              item.ocrScore >= 80 ? "bg-emerald-500" : item.ocrScore >= 60 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${item.ocrScore}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-sm font-bold",
                          item.ocrScore >= 80 ? "text-emerald-600" : item.ocrScore >= 60 ? "text-amber-600" : "text-red-600"
                        )}>
                          {item.ocrScore}%
                        </span>
                      </div>
                    )}

                    {/* Notes and actions */}
                    <div className="space-y-3">
                      <textarea
                        value={notes[item.id] || ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Add review notes..."
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDecision(item.id, "approved")}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleDecision(item.id, "rejected")}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
