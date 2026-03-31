"use client";

import { useState } from "react";
import { useAdminUsers } from "@/hooks/use-admin";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  UserPlus,
  Mail,
} from "lucide-react";

const roles = ["admin", "manager", "agent", "readonly"];

export default function UsersSettingsPage() {
  const { data: rawUsers, isLoading } = useAdminUsers();
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");
  const [invited, setInvited] = useState(false);

  const users = (rawUsers ?? []).map((u: any) => ({
    id: u.id,
    name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "Unknown",
    email: u.users?.email ?? u.email ?? "--",
    role: u.role ?? "agent",
    active: u.is_active ?? true,
    lastLogin: u.last_login_at ? new Date(u.last_login_at).toISOString().slice(0, 10) : "Never",
  }));

  const toggleActive = async (id: string, currentActive: boolean) => {
    const supabase = createClient();
    await supabase
      .from("admin_users")
      .update({ is_active: !currentActive })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const changeRole = async (id: string, role: string) => {
    const supabase = createClient();
    await supabase
      .from("admin_users")
      .update({ role })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const handleInvite = async () => {
    if (!inviteName || !inviteEmail) return;
    const [firstName, ...rest] = inviteName.split(" ");
    const lastName = rest.join(" ");
    const supabase = createClient();
    await supabase.from("admin_users").insert({
      first_name: firstName,
      last_name: lastName || null,
      email: inviteEmail,
      role: inviteRole,
      is_active: true,
    });
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    setInviteName("");
    setInviteEmail("");
    setInviteRole("agent");
    setInvited(true);
    setTimeout(() => { setInvited(false); setShowInvite(false); }, 1500);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
        </div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin/settings" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </a>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage team members and permissions</p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Invite New User</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Full Name</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Thato Modise"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="e.g. thato@typocash.co.bw"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleInvite}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" /> Send Invite
            </button>
            {invited && <span className="text-xs text-emerald-600 font-medium">Invitation sent!</span>}
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Name</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Email</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Last Login</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No admin users found.</td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-sky-600">
                            {u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">{u.email}</td>
                    <td className="px-6 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent capitalize"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">{u.lastLogin}</td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => toggleActive(u.id, u.active)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          u.active ? "bg-sky-500" : "bg-slate-300"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            u.active ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
