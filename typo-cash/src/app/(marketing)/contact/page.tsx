import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { COMPANY_PHONE, COMPANY_EMAIL, COMPANY_WHATSAPP, COMPANY_ADDRESS } from "@/lib/constants";
import { NBFIRABadge } from "@/components/brand/nbfira-badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Typo Cash Solutions. We're here to help.",
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Contact Us</h1>
        <p className="mt-4 text-lg text-slate-600">
          We&apos;re here to help. Reach out through any of these channels.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {[
          { icon: Phone, title: "Phone", value: COMPANY_PHONE, href: `tel:${COMPANY_PHONE.replace(/\s/g, "")}`, cta: "Call now" },
          { icon: MessageCircle, title: "WhatsApp", value: COMPANY_WHATSAPP, href: `https://wa.me/${COMPANY_WHATSAPP.replace(/[^0-9]/g, "")}`, cta: "Chat now" },
          { icon: Mail, title: "Email", value: COMPANY_EMAIL, href: `mailto:${COMPANY_EMAIL}`, cta: "Send email" },
          { icon: MapPin, title: "Visit Us", value: COMPANY_ADDRESS, href: "#", cta: "Get directions" },
        ].map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-all duration-200 cursor-pointer block"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{item.value}</p>
                <span className="inline-block mt-2 text-sm font-medium text-primary">
                  {item.cta} &rarr;
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-slate-900">Business Hours</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-slate-600">Monday – Friday</span>
          <span className="text-slate-900 font-medium">8:00 AM – 5:00 PM</span>
          <span className="text-slate-600">Saturday</span>
          <span className="text-slate-900 font-medium">9:00 AM – 1:00 PM</span>
          <span className="text-slate-600">Sunday & Holidays</span>
          <span className="text-slate-900 font-medium">Closed</span>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Online applications and the loan calculator are available 24/7.
        </p>
      </div>

      <div className="flex justify-center">
        <NBFIRABadge />
      </div>
    </div>
  );
}
