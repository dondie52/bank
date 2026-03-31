"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How much can I borrow?",
    answer:
      "You can borrow from P500 to P7,000 depending on the loan product. Quick Cash offers up to P3,000, Emergency up to P5,000, and Instalment and Salary-Backed loans up to P7,000.",
  },
  {
    question: "How quickly will I receive my funds?",
    answer:
      "After your 48-hour cooling-off period, funds are disbursed the same day via bank transfer or mobile money. Most borrowers receive their money within hours of the cooling-off expiry.",
  },
  {
    question: "What is the 48-hour cooling-off period?",
    answer:
      "By regulation, you have 48 hours after signing your loan agreement to cancel with no penalty. This protects you from making hasty decisions. After 48 hours, your loan becomes active and funds are disbursed.",
  },
  {
    question: "What documents do I need?",
    answer:
      "You'll need your Omang (national ID), a recent payslip or proof of income, and bank account details. Everything is uploaded through the app — no need to visit an office.",
  },
  {
    question: "How is interest calculated?",
    answer:
      "We use simple interest only (required by law). The formula is: Principal × Rate × Days / 365. For example, P2,000 at 12% for 30 days = P19.73 in interest. Our calculator shows you the exact amount before you apply.",
  },
  {
    question: "What happens if I can't repay on time?",
    answer:
      "Contact us immediately — we want to help. Late payments incur a penalty of up to 5% of the outstanding balance per month, but penalties are capped and can never exceed your original loan amount (in duplum rule). We offer restructuring options for genuine hardship.",
  },
  {
    question: "Is Typo Cash Solutions a licensed lender?",
    answer:
      "Yes. We are fully licensed by the Non-Bank Financial Institutions Regulatory Authority (NBFIRA) under the Micro Lending regulations. Our licence number is displayed at the bottom of every page.",
  },
  {
    question: "Can I repay early?",
    answer:
      "Absolutely. You can repay your loan in full at any time with no early repayment penalties. You'll only pay interest for the days you've had the loan.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            FAQ
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900">
            Common Questions
          </p>
        </div>

        <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex items-center justify-between w-full py-5 text-left cursor-pointer group"
                >
                  <span className="text-base font-medium text-slate-900 pr-8 group-hover:text-primary transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180 text-primary"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isOpen ? "max-h-96 pb-5" : "max-h-0"
                  )}
                >
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
