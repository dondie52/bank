"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { LogoIcon } from "@/components/brand/logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-modal border border-slate-200 p-4 flex items-center gap-3">
        <LogoIcon size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">Install Typo Cash</p>
          <p className="text-xs text-slate-500">Add to home screen for quick access</p>
        </div>
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 px-3 h-9 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
