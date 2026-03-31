"use client";

import { Bell, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyNotifications } from "@/hooks/use-notifications";
import { CardSkeleton } from "@/components/common/loading-skeleton";

const iconMap = {
  success: { icon: CheckCircle, bg: "bg-emerald-100", color: "text-emerald-600" },
  warning: { icon: AlertTriangle, bg: "bg-amber-100", color: "text-amber-600" },
  info: { icon: Info, bg: "bg-sky-100", color: "text-primary" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useMyNotifications();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>

      {!notifications || notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-8 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: { id: string; channel?: string; title?: string; subject?: string; body?: string; message?: string; sent_at: string; read_at?: string | null }) => {
            // Map notification channel/type to icon style
            const type = n.channel === "sms" ? "info" : "info";
            const style = iconMap[type as keyof typeof iconMap] || iconMap.info;
            const isRead = !!n.read_at;
            return (
              <div
                key={n.id}
                className={cn(
                  "bg-white rounded-xl shadow-card p-4 flex gap-3",
                  !isRead && "border-l-4 border-primary"
                )}
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", style.bg)}>
                  <style.icon className={cn("w-5 h-5", style.color)} />
                </div>
                <div className="flex-1">
                  <p className={cn("text-sm font-medium", isRead ? "text-slate-700" : "text-slate-900")}>
                    {n.title ?? n.subject ?? "Notification"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.body ?? n.message ?? ""}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.sent_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
