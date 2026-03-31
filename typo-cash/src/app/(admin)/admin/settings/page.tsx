"use client";

import { cn } from "@/lib/utils";
import {
  Package,
  Users,
  Bell,
  ChevronRight,
} from "lucide-react";

const sections = [
  {
    title: "Loan Products",
    description: "Manage loan products, rates, amounts, and terms",
    icon: Package,
    href: "/admin/settings/products",
    color: "bg-sky-100 text-sky-600",
  },
  {
    title: "Admin Users",
    description: "Manage admin users, roles, and access permissions",
    icon: Users,
    href: "/admin/settings/users",
    color: "bg-violet-100 text-violet-600",
  },
  {
    title: "Notifications",
    description: "Configure notification templates and channels",
    icon: Bell,
    href: "/admin/settings/notifications",
    color: "bg-amber-100 text-amber-600",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">System configuration and administration</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <a
            key={section.title}
            href={section.href}
            className="bg-white rounded-xl shadow-card p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", section.color)}>
                <section.icon className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{section.title}</h3>
            <p className="text-sm text-slate-500">{section.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
