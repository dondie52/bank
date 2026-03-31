import Link from "next/link";
import { Logo } from "./logo";
import { NBFIRABadge } from "./nbfira-badge";
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  NBFIRA_LICENCE,
} from "@/lib/constants";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo variant="white" size="lg" />
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              Friendly, regulated micro-loans for working people in Botswana.
              Bridging the gap between paydays with dignity and trust.
            </p>
            <div className="mt-4">
              <NBFIRABadge variant="compact" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/calculator", label: "Loan Calculator" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/login", label: "Sign In" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Loan Products
            </h3>
            <ul className="space-y-3">
              {[
                "Quick Cash (P500–P3,000)",
                "Emergency Loan (P500–P5,000)",
                "Instalment Loan (P1,000–P7,000)",
                "Salary-Backed (P2,000–P7,000)",
              ].map((product) => (
                <li key={product} className="text-sm text-slate-400">
                  {product}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-400">{COMPANY_PHONE}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-400">{COMPANY_EMAIL}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-400">{COMPANY_ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Typo Cash Solutions (Pty) Ltd. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              Licensed by NBFIRA | Licence No: {NBFIRA_LICENCE} | Gaborone, Botswana
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
