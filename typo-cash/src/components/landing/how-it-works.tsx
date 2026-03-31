import { Calculator, FileText, Zap } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Calculator,
    title: "Calculate Your Loan",
    description:
      "Use our calculator to find the right amount and term. See exactly what you'll repay — no surprises.",
    color: "bg-sky-100 text-primary",
  },
  {
    number: "2",
    icon: FileText,
    title: "Apply in Minutes",
    description:
      "Complete a quick application on your phone. Upload your ID and we'll verify you instantly.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    number: "3",
    icon: Zap,
    title: "Receive Cash",
    description:
      "Once approved, funds go straight to your bank account or mobile wallet. Same day, no waiting.",
    color: "bg-amber-100 text-amber-600",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            How It Works
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900">
            Get Funded in Minutes
          </p>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Three simple steps to get the cash you need. No paperwork, no queues, no hassle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative group">
              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-slate-200" />
              )}

              <div className="relative bg-white rounded-xl shadow-card p-6 sm:p-8 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer">
                {/* Step number */}
                <div className="absolute -top-3 -left-2 w-8 h-8 bg-primary text-white text-sm font-bold rounded-full flex items-center justify-center shadow-sm">
                  {step.number}
                </div>

                <div className={`w-14 h-14 ${step.color} rounded-xl flex items-center justify-center mb-5`}>
                  <step.icon className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
