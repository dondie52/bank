"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";

interface MoneyDisplayProps {
  amount: bigint;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl",
};

export function MoneyDisplay({ amount, className, size = "md" }: MoneyDisplayProps) {
  return (
    <span className={cn("font-mono font-medium tabular-nums", sizeClasses[size], className)}>
      {formatMoney(amount)}
    </span>
  );
}
