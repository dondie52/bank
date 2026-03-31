import { cn } from "@/lib/utils";
import { LOAN_STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = LOAN_STATUS_COLORS[status] ?? {
    bg: "bg-slate-100",
    text: "text-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        colors.bg,
        colors.text,
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
