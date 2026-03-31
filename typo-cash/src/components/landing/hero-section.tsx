"use client";

import { CalculatorWidget } from "@/components/loan/calculator-widget";
import { Shield, Zap, Clock } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Licensed by NBFIRA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-display-lg font-bold text-white leading-tight tracking-tight">
              Quick Cash When{" "}
              <span className="relative">
                You Need It
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6C50 2 150 2 198 6"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              Most
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Friendly, regulated loans from P500 to P7,000. Apply in minutes,
              get approved fast, and receive funds straight to your account.
              No hidden fees — ever.
            </p>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6">
              {[
                { icon: Zap, label: "Approved in minutes" },
                { icon: Clock, label: "Funds same day" },
                { icon: Shield, label: "NBFIRA regulated" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/90">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Calculator */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <CalculatorWidget variant="hero" />
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 40C240 70 480 80 720 60C960 40 1200 10 1440 30V80H0V40Z"
            fill="#F8FAFC"
          />
        </svg>
      </div>
    </section>
  );
}
