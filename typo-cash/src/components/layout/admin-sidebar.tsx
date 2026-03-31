"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Wallet,
  AlertTriangle,
  Banknote,
  ShieldCheck,
  ScrollText,
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/borrowers", label: "Borrowers", icon: Users },
  { href: "/admin/loans", label: "Loans", icon: Wallet },
  { href: "/admin/collections", label: "Collections", icon: AlertTriangle },
  { href: "/admin/disbursements", label: "Disbursements", icon: Banknote },
  { href: "/admin/kyc-review", label: "KYC Review", icon: ClipboardCheck },
  { href: "/admin/disputes", label: "Disputes", icon: MessageSquare },
  { href: "/admin/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/admin/compliance/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile topbar */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-slate-200 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <Logo size="sm" />
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-72 h-full bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200">
              <Logo size="md" />
            </div>
            <nav className="p-2">
              {menuItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  {...item}
                  active={isActive(pathname, item.href)}
                  collapsed={false}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white lg:z-40 transition-all duration-200",
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <div className={cn(
          "flex items-center border-b border-slate-200 h-16 px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {collapsed ? (
            <Logo size="sm" showText={false} />
          ) : (
            <Logo size="sm" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer",
              collapsed && "hidden"
            )}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {menuItems.map((item) => (
            <SidebarLink
              key={item.href}
              {...item}
              active={isActive(pathname, item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="p-3 border-t border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
            aria-label="Expand sidebar"
          >
            <Menu className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </aside>

      {/* Main content */}
      <main className={cn(
        "transition-all duration-200",
        collapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer",
        active
          ? "bg-sky-50 text-primary"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", active && "stroke-[2.5]")} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}
