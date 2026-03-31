import { Shield, Lock, Eye, Scale } from "lucide-react";
import { NBFIRABadge } from "@/components/brand/nbfira-badge";

const trustItems = [
  {
    icon: Shield,
    title: "NBFIRA Licensed",
    description:
      "Fully regulated by the Non-Bank Financial Institutions Regulatory Authority. Your protection is guaranteed by law.",
  },
  {
    icon: Eye,
    title: "Transparent Pricing",
    description:
      "What you see is what you pay. Our calculator shows the exact total - no hidden fees, no surprises.",
  },
  {
    icon: Scale,
    title: "Fair Lending",
    description:
      "Simple interest only. Penalty caps protect you from debt spirals. 48-hour cooling-off period on every loan.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description:
      "256-bit encryption, secure OTP verification, and strict data protection for your personal information.",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 sm:py-24 bg-sky-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Why Trust Us
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900">
            Your Financial Safety Comes First
          </p>
          <div className="flex justify-center mt-6">
            <NBFIRABadge />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 p-6 bg-white rounded-xl shadow-card"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
