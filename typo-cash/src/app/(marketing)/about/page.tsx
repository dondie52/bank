import { Shield, Eye, Users, Zap } from "lucide-react";
import { NBFIRABadge } from "@/components/brand/nbfira-badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Typo Cash Solutions - NBFIRA-licensed micro-lender in Botswana.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">About Typo Cash Solutions</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          We exist to provide quick, regulated, and affordable financial access to working
          people in Botswana. Responsible micro-loans should be a friendly helper, not a burden.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed">
            To bridge the gap between paydays with dignity and trust, empowering salaried
            workers and the informal sector to manage unexpected expenses with ease and speed.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Our Vision</h2>
          <p className="text-slate-600 leading-relaxed">
            To become Botswana&apos;s most trusted digital financial companion, setting the standard
            for transparent micro-lending in Southern Africa.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Our Values</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
        {[
          { icon: Eye, title: "Transparency", description: "No hidden fees, no surprises. What you calculate is what you repay." },
          { icon: Zap, title: "Speed", description: "Funds disbursed in minutes, because some cash solutions can't wait." },
          { icon: Shield, title: "Fairness", description: "Licensed by NBFIRA, we operate with ethical, regulated pricing models." },
          { icon: Users, title: "Approachability", description: "A friendly, non-judgmental digital partner that speaks your language." },
        ].map((v) => (
          <div key={v.title} className="flex gap-4 p-5 bg-white rounded-xl shadow-card">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <v.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">{v.title}</h3>
              <p className="text-sm text-slate-600">{v.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <NBFIRABadge />
      </div>
    </div>
  );
}
