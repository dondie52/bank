"use client";

import { useState } from "react";
import { FileUpload } from "@/components/common/file-upload";
import { useBorrower } from "@/hooks/use-borrower";
import { createClient } from "@/lib/supabase/client";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { CheckCircle, Clock, Camera, CreditCard, Home, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "omang_front" | "omang_back" | "selfie" | "proof_of_residence";

const kycSteps: { id: Step; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: "omang_front", label: "Omang Front", icon: CreditCard, description: "Take a clear photo of the front of your Omang" },
  { id: "omang_back", label: "Omang Back", icon: CreditCard, description: "Take a clear photo of the back of your Omang" },
  { id: "selfie", label: "Selfie", icon: Camera, description: "Take a selfie matching your Omang photo" },
  { id: "proof_of_residence", label: "Proof of Residence", icon: Home, description: "Upload a utility bill or bank statement" },
];

export default function KYCPage() {
  const { borrower, loading: borrowerLoading } = useBorrower();
  const [completed, setCompleted] = useState<Set<Step>>(new Set());
  const [activeStep, setActiveStep] = useState<Step>("omang_front");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (borrowerLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const handleFileSelect = (step: Step) => async (file: File) => {
    if (!borrower) return;
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const filePath = `${borrower.id}/${step}_${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Insert a document record in the DB
      const { error: dbError } = await supabase.from("documents").insert({
        borrower_id: borrower.id,
        document_type: step,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        status: "pending",
      });

      if (dbError) throw dbError;

      setCompleted((prev) => new Set([...prev, step]));
      const currentIndex = kycSteps.findIndex((s) => s.id === step);
      if (currentIndex < kycSteps.length - 1) {
        setActiveStep(kycSteps[currentIndex + 1].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const allComplete = completed.size === kycSteps.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verify Your Identity</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete KYC verification to apply for loans
        </p>
      </div>

      {/* Status */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-lg",
        allComplete ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"
      )}>
        {allComplete ? (
          <>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Verification Complete</p>
              <p className="text-xs text-emerald-700">Your documents are being reviewed</p>
            </div>
          </>
        ) : (
          <>
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Verification Required</p>
              <p className="text-xs text-amber-700">{completed.size} of {kycSteps.length} documents uploaded</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-4">
        {kycSteps.map((step) => {
          const isCompleted = completed.has(step.id);
          const isActive = activeStep === step.id;

          return (
            <div
              key={step.id}
              className={cn(
                "bg-white rounded-xl shadow-card overflow-hidden transition-all duration-200",
                isActive && "ring-2 ring-primary"
              )}
            >
              <button
                onClick={() => !isCompleted && setActiveStep(step.id)}
                className="flex items-center gap-3 w-full p-4 cursor-pointer"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  isCompleted ? "bg-emerald-100" : "bg-slate-100"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <step.icon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-slate-900">{step.label}</p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
                {isCompleted && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Done
                  </span>
                )}
              </button>

              {isActive && !isCompleted && (
                <div className="px-4 pb-4">
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm text-slate-600">Uploading...</span>
                    </div>
                  ) : (
                    <FileUpload
                      label={`Upload ${step.label}`}
                      accept="image/*"
                      showCamera={step.id !== "proof_of_residence"}
                      onFileSelect={handleFileSelect(step.id)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
