"use client";

import { Logo } from "@/components/brand/logo";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-sky-50">
      <Logo size="lg" className="mb-8" />
      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8 text-slate-400" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">You&apos;re Offline</h1>
      <p className="text-sm text-slate-600 text-center max-w-xs">
        Please check your internet connection and try again.
        Your data is safe and will sync when you reconnect.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 h-11 px-8 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
