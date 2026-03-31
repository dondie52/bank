import Link from "next/link";
import { ArrowRight, Zap, AlertTriangle, Calendar, Briefcase } from "lucide-react";

const products = [
  {
    name: "Quick Cash",
    icon: Zap,
    range: "P500 – P3,000",
    rate: "12%",
    term: "14–30 days",
    description: "For small, urgent expenses. Fast approval, single repayment.",
    highlight: "Most Popular",
    color: "border-primary",
    iconBg: "bg-sky-100 text-primary",
  },
  {
    name: "Emergency Loan",
    icon: AlertTriangle,
    range: "P500 – P5,000",
    rate: "15%",
    term: "30 days",
    description: "When life throws a curveball. Higher limits for when you really need it.",
    highlight: null,
    color: "border-amber-400",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    name: "Instalment Loan",
    icon: Calendar,
    range: "P1,000 – P7,000",
    rate: "18%",
    term: "60–90 days",
    description: "Spread your payments comfortably over 2–3 months with equal instalments.",
    highlight: null,
    color: "border-emerald-400",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "Salary-Backed",
    icon: Briefcase,
    range: "P2,000 – P7,000",
    rate: "15%",
    term: "90 days",
    description: "Backed by your steady income. Better terms for employed professionals.",
    highlight: "Best Rate",
    color: "border-violet-400",
    iconBg: "bg-violet-100 text-violet-600",
  },
];

export function ProductCards() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Our Products
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900">
            A Loan for Every Need
          </p>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the product that fits your situation. Transparent terms, fair rates, no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className={`relative bg-white rounded-xl border-t-4 ${product.color} shadow-card p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer flex flex-col`}
            >
              {product.highlight && (
                <span className="absolute -top-3 right-4 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-sm">
                  {product.highlight}
                </span>
              )}

              <div className={`w-12 h-12 ${product.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <product.icon className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-slate-600 mb-4 flex-1">
                {product.description}
              </p>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-mono font-medium text-slate-900">{product.range}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Rate</span>
                  <span className="font-mono font-medium text-slate-900">{product.rate} p.a.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Term</span>
                  <span className="font-mono font-medium text-slate-900">{product.term}</span>
                </div>
              </div>

              <Link
                href="/apply"
                className="mt-5 flex items-center justify-center gap-2 w-full h-11 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-sky-50 transition-colors duration-200"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
