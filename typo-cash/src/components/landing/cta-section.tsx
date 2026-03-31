import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { COMPANY_PHONE } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.1),transparent_60%)]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
          Ready to Get Started?
        </h2>
        <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
          Join thousands of Batswana who trust Typo Cash Solutions for
          quick, fair, and transparent micro-loans.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-white text-primary font-semibold rounded-lg hover:bg-sky-50 transition-colors duration-200 shadow-lg cursor-pointer w-full sm:w-auto"
          >
            Apply Now — It&apos;s Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors duration-200 border border-white/30 cursor-pointer w-full sm:w-auto"
          >
            <Phone className="w-4 h-4" />
            Call Us
          </a>
        </div>

        <p className="mt-6 text-sm text-white/70">
          No credit card needed. No commitment. Cancel any time during the cooling-off period.
        </p>
      </div>
    </section>
  );
}
