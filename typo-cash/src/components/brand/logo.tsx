"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
  showText?: boolean;
}

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 48, text: "text-2xl" },
};

export function Logo({ className, size = "md", variant = "default", showText = true }: LogoProps) {
  const { icon, text } = sizes[size];
  const color = variant === "white" ? "#FFFFFF" : "#0EA5E9";
  const textColor = variant === "white" ? "text-white" : "text-primary";
  const subColor = variant === "white" ? "text-white/80" : "text-secondary";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ShieldIcon size={icon} color={color} />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-bold tracking-tight", text, textColor)}>
            Typo Cash
          </span>
          <span className={cn("text-xs font-medium -mt-0.5", subColor)}>
            Solutions
          </span>
        </div>
      )}
    </div>
  );
}

function ShieldIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shield outline */}
      <path
        d="M24 4L8 12V24C8 34 15 42.5 24 44C33 42.5 40 34 40 24V12L24 4Z"
        fill={color}
        opacity="0.12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pula symbol (P with strikethrough) */}
      <path
        d="M18 32V18H23C25.2091 18 27 19.7909 27 22C27 24.2091 25.2091 26 23 26H18"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="16"
        y1="22"
        x2="28"
        y2="22"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Upward growth arrow */}
      <path
        d="M30 30L34 20M34 20L38 30M34 20V16"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="31,18 34,14 37,18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function LogoIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <div className={className}>
      <ShieldIcon size={size} color="#0EA5E9" />
    </div>
  );
}
