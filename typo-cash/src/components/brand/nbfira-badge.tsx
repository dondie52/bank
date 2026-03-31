import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { NBFIRA_LICENCE } from "@/lib/constants";

interface NBFIRABadgeProps {
  className?: string;
  variant?: "default" | "compact";
}

export function NBFIRABadge({ className, variant = "default" }: NBFIRABadgeProps) {
  if (variant === "compact") {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 rounded-lg",
        className
      )}>
        <Shield className="w-3.5 h-3.5 text-sky-700" />
        <span className="text-xs font-medium text-sky-700">Licensed by NBFIRA</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 bg-sky-50 rounded-lg border border-sky-100",
      className
    )}>
      <div className="flex-shrink-0 w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
        <Shield className="w-5 h-5 text-sky-700" />
      </div>
      <div>
        <p className="text-sm font-semibold text-sky-900">Licensed by NBFIRA</p>
        <p className="text-xs text-sky-700">{NBFIRA_LICENCE}</p>
      </div>
    </div>
  );
}
