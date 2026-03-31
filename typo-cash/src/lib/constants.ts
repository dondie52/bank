export const APP_NAME = "Typo Cash Solutions";
export const APP_TAGLINE = "Quick Cash, Real Solutions";
export const APP_DESCRIPTION =
  "Friendly, regulated loans in Botswana. P500–P7,000.";

export const NBFIRA_LICENCE = "NBFIRA/ML/2024/XXX";
export const COMPANY_ADDRESS = "Plot 123, Fairgrounds Office Park, Gaborone, Botswana";
export const COMPANY_PHONE = "+267 3XX XXXX";
export const COMPANY_EMAIL = "info@typocash.co.bw";
export const COMPANY_WHATSAPP = "+267 7X XXX XXX";

export const MIN_LOAN_AMOUNT = 50000n; // P500 in thebe
export const MAX_LOAN_AMOUNT = 700000n; // P7,000 in thebe

export const COOLING_OFF_HOURS = 48;
export const MAX_DTI_RATIO = 0.6; // 60%
export const MAX_INSTALMENT_RATIO = 0.3; // 30% of disposable income
export const MAX_PENALTY_RATE = 5.0; // 5% per month

export const LOAN_PRODUCTS = [
  {
    id: "quick-cash",
    name: "Quick Cash",
    code: "QC",
    description: "For small, urgent expenses",
    minAmount: 50000n,
    maxAmount: 300000n,
    minTermDays: 14,
    maxTermDays: 30,
    interestRate: 12,
    originationFee: 2500n,
  },
  {
    id: "emergency",
    name: "Emergency Loan",
    code: "EM",
    description: "When life throws a curveball",
    minAmount: 50000n,
    maxAmount: 500000n,
    minTermDays: 30,
    maxTermDays: 30,
    interestRate: 15,
    originationFee: 5000n,
  },
  {
    id: "instalment",
    name: "Instalment Loan",
    code: "IN",
    description: "Spread payments over time",
    minAmount: 100000n,
    maxAmount: 700000n,
    minTermDays: 60,
    maxTermDays: 90,
    interestRate: 18,
    originationFee: 7500n,
  },
  {
    id: "salary-backed",
    name: "Salary-Backed Loan",
    code: "SB",
    description: "Backed by your steady income",
    minAmount: 200000n,
    maxAmount: 700000n,
    minTermDays: 90,
    maxTermDays: 90,
    interestRate: 15,
    originationFee: 5000n,
  },
] as const;

export const LOAN_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-slate-100", text: "text-slate-700" },
  approved: { bg: "bg-sky-100", text: "text-sky-700" },
  cooling_off: { bg: "bg-amber-100", text: "text-amber-700" },
  active: { bg: "bg-emerald-100", text: "text-emerald-700" },
  overdue: { bg: "bg-red-100", text: "text-red-700" },
  collections: { bg: "bg-red-100", text: "text-red-700" },
  restructured: { bg: "bg-amber-100", text: "text-amber-700" },
  closed: { bg: "bg-emerald-100", text: "text-emerald-700" },
  written_off: { bg: "bg-slate-100", text: "text-slate-700" },
  cancelled: { bg: "bg-slate-100", text: "text-slate-700" },
};

export const REFERENCE_NUMBER_PREFIX = "TC";
