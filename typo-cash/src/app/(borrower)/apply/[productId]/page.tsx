"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { LOAN_PRODUCTS } from "@/lib/constants";
import { calculateSimpleInterest } from "@/lib/loan-engine/interest-calculator";
import { formatMoney, pulaToThebe } from "@/lib/money";
import { ArrowLeft, ArrowRight, Check, Loader2, Upload } from "lucide-react";
import { submitLoanApplication } from "./actions";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Loan Amount", description: "Choose amount & term" },
  { title: "Employment", description: "Your income details" },
  { title: "Bank Account", description: "Where to send funds" },
  { title: "Review & Submit", description: "Confirm & apply" },
];

export default function ApplyWizardPage() {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = LOAN_PRODUCTS.find((p) => p.id === params.productId);

  const minPula = product ? Number(product.minAmount) / 100 : 0;
  const maxPula = product ? Number(product.maxAmount) / 100 : 0;

  const [form, setForm] = useState({
    amount: Math.round((minPula + maxPula) / 2),
    termDays: product?.minTermDays ?? 0,
    employerName: "",
    employerPhone: "",
    employmentStartDate: "",
    netMonthlySalary: "",
    bankName: "",
    branchCode: "",
    accountNumber: "",
    accountHolderName: "",
    accountType: "savings",
    creditCheckConsent: false,
  });

  const update = (field: string, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const calculation = useMemo(() => {
    if (!product) return { principal: 0n, interest: 0n, originationFee: 0n, totalRepayable: 0n };
    const principal = pulaToThebe(form.amount);
    const interest = calculateSimpleInterest(principal, product.interestRate, form.termDays);
    return {
      principal,
      interest,
      originationFee: product.originationFee,
      totalRepayable: principal + interest + product.originationFee,
    };
  }, [form.amount, form.termDays, product]);

  if (!product) return <div className="text-center py-8 text-slate-500">Product not found</div>;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await submitLoanApplication({
        productCode: product.code,
        productName: product.name,
        interestRate: product.interestRate,
        principalThebe: Number(calculation.principal),
        interestThebe: Number(calculation.interest),
        originationFeeThebe: Number(calculation.originationFee),
        totalRepayableThebe: Number(calculation.totalRepayable),
        termDays: form.termDays,
      });

      if (result.error) throw new Error(result.error);

      // Store loan info for success page
      sessionStorage.setItem("last_loan", JSON.stringify({
        referenceNumber: result.referenceNumber,
        amount: formatMoney(calculation.principal),
        totalRepayable: formatMoney(calculation.totalRepayable),
        termDays: form.termDays,
        productName: product.name,
      }));

      router.push(`/apply/${params.productId}/success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.back()}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
          <p className="text-xs text-slate-500">Step {currentStep + 1} of {steps.length}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => (
          <div key={i} className="flex-1">
            <div
              className={cn(
                "h-1 rounded-full transition-colors duration-300",
                i <= currentStep ? "bg-primary" : "bg-slate-200",
                i === currentStep && "animate-pulse"
              )}
            />
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl shadow-card p-5">
        {currentStep === 0 && (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Loan Amount</label>
                <span className="text-lg font-mono font-bold text-primary">
                  P{form.amount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={minPula}
                max={maxPula}
                step={100}
                value={form.amount}
                onChange={(e) => update("amount", Number(e.target.value))}
                className="w-full h-2 bg-sky-100 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{formatMoney(product.minAmount)}</span>
                <span>{formatMoney(product.maxAmount)}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Term</label>
              <div className="grid grid-cols-3 gap-2">
                {[product.minTermDays, ...(product.minTermDays !== product.maxTermDays ? [product.maxTermDays] : [])].map((d) => (
                  <button
                    key={d}
                    onClick={() => update("termDays", d)}
                    className={cn(
                      "h-10 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                      form.termDays === d
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-sky-50"
                    )}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            {/* Live calculation */}
            <div className="bg-sky-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Principal</span>
                <span className="font-mono font-medium">{formatMoney(calculation.principal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Interest</span>
                <span className="font-mono font-medium">{formatMoney(calculation.interest)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Origination Fee</span>
                <span className="font-mono font-medium">{formatMoney(calculation.originationFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-sky-200">
                <span className="text-slate-900">Total Repayable</span>
                <span className="font-mono text-primary">{formatMoney(calculation.totalRepayable)}</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Employment Details</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Employer Name</label>
              <input
                value={form.employerName}
                onChange={(e) => update("employerName", e.target.value)}
                placeholder="e.g. Debswana"
                className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Net Monthly Salary (Pula)</label>
              <input
                type="number"
                value={form.netMonthlySalary}
                onChange={(e) => update("netMonthlySalary", e.target.value)}
                placeholder="e.g. 8500"
                className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Employment Start Date</label>
              <input
                type="date"
                value={form.employmentStartDate}
                onChange={(e) => update("employmentStartDate", e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload Payslip</label>
              <label className="flex items-center justify-center gap-2 w-full h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary hover:bg-sky-50/50 transition-colors">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-500">Tap to upload payslip</span>
                <input type="file" accept="image/*,.pdf" className="hidden" />
              </label>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Bank Account for Disbursement</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank Name</label>
              <select
                value={form.bankName}
                onChange={(e) => update("bankName", e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select bank</option>
                <option>First National Bank Botswana</option>
                <option>Standard Chartered Botswana</option>
                <option>Barclays Bank Botswana</option>
                <option>Stanbic Bank Botswana</option>
                <option>Bank of Baroda</option>
                <option>Bank Gaborone</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch Code</label>
                <input
                  value={form.branchCode}
                  onChange={(e) => update("branchCode", e.target.value)}
                  placeholder="282567"
                  className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Type</label>
                <select
                  value={form.accountType}
                  onChange={(e) => update("accountType", e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
              <input
                value={form.accountNumber}
                onChange={(e) => update("accountNumber", e.target.value)}
                placeholder="62123456789"
                className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Holder Name</label>
              <input
                value={form.accountHolderName}
                onChange={(e) => update("accountHolderName", e.target.value)}
                placeholder="FULL NAME"
                className="w-full h-11 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Review Your Application</h3>

            <div className="bg-sky-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Product</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Amount</span>
                <span className="font-mono font-medium">{formatMoney(calculation.principal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Term</span>
                <span className="font-medium">{form.termDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Interest Rate</span>
                <span className="font-medium">{product.interestRate}% p.a. (simple)</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-sky-200">
                <span>Total Repayable</span>
                <span className="font-mono text-primary">{formatMoney(calculation.totalRepayable)}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Employer</span>
                <span className="font-medium">{form.employerName || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Bank</span>
                <span className="font-medium">{form.bankName || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Account</span>
                <span className="font-mono">****{form.accountNumber.slice(-4) || "-"}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <label className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={form.creditCheckConsent}
                onChange={(e) => update("creditCheckConsent", e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-700">
                I consent to a credit check and confirm that the information provided is accurate.
                I understand the loan terms and agree to the cooling-off period policy.
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1 h-12 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Back
          </button>
        )}
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="flex-1 flex items-center justify-center gap-2 h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!form.creditCheckConsent || loading}
            className="flex-1 flex items-center justify-center gap-2 h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Submit Application
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
