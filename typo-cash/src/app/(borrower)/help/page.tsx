import { Phone, Mail, MessageCircle, MapPin, Shield, HelpCircle } from "lucide-react";
import { COMPANY_PHONE, COMPANY_EMAIL, COMPANY_WHATSAPP } from "@/lib/constants";
import { NBFIRABadge } from "@/components/brand/nbfira-badge";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Help & Support</h1>

      {/* Contact options */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Phone, label: "Call Us", value: COMPANY_PHONE, href: `tel:${COMPANY_PHONE.replace(/\s/g, "")}` },
          { icon: MessageCircle, label: "WhatsApp", value: "Chat now", href: `https://wa.me/${COMPANY_WHATSAPP.replace(/[^0-9]/g, "")}` },
          { icon: Mail, label: "Email", value: COMPANY_EMAIL, href: `mailto:${COMPANY_EMAIL}` },
          { icon: MapPin, label: "Visit Us", value: "Gaborone", href: "#" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-2 bg-white rounded-xl shadow-card p-4 hover:shadow-card-hover transition-all cursor-pointer"
          >
            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-slate-900">{item.label}</span>
            <span className="text-xs text-slate-500 text-center">{item.value}</span>
          </a>
        ))}
      </div>

      {/* Quick FAQ */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-slate-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { q: "How do I make a payment?", a: "Go to Loans → Select your loan → Make a Payment. You can pay via bank transfer, debit order, or mobile money." },
            { q: "Can I cancel my loan?", a: "Yes, during the 48-hour cooling-off period you can cancel with no penalty. After that, you can repay early at any time." },
            { q: "How are penalties calculated?", a: "Up to 5% of outstanding principal per month, capped so total penalties never exceed your principal amount." },
          ].map((faq, i) => (
            <div key={i} className="px-5 py-4">
              <p className="text-sm font-medium text-slate-900 mb-1">{faq.q}</p>
              <p className="text-xs text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* NBFIRA complaint process */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-sky-700" />
          <h3 className="text-sm font-semibold text-sky-900">NBFIRA Complaint Process</h3>
        </div>
        <p className="text-xs text-sky-800 leading-relaxed">
          If you are unsatisfied with our resolution, you may lodge a complaint with the
          Non-Bank Financial Institutions Regulatory Authority (NBFIRA).
          Contact NBFIRA at +267 310 2595 or visit their offices at Plot 54516, CBD, Gaborone.
        </p>
      </div>

      <NBFIRABadge variant="compact" className="mx-auto" />
    </div>
  );
}
