"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Menu, Moon, Search } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface DashboardNavbarProps {
  onToggleMenu?: () => void;
}

export default function DashboardNavbar({ onToggleMenu }: DashboardNavbarProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!getToken()) return;
      try {
        const data = await api.get<UserProfile>("/users/me");
        setUser(data);
      } catch (err: any) {
        if (err?.message !== "Not authenticated") {
          console.error("Failed to load user profile in navbar:", err);
        }
      }
    }
    fetchUser();
  }, []);

  const displayName = user?.full_name?.trim() || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 gap-3">
      <div className="flex items-center gap-3">
        {onToggleMenu && (
          <button
            onClick={onToggleMenu}
            aria-label="Open menu"
            className="lg:hidden rounded-xl p-2.5 hover:bg-slate-100 text-slate-700"
          >
            <Menu size={22} />
          </button>
        )}

        <div className="relative w-36 sm:w-64 md:w-96">
          <Search
            className="absolute left-3 sm:left-4 top-3.5 text-slate-400"
            size={18}
          />
          <input
            placeholder="Search..."
            className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 sm:py-3 pl-9 sm:pl-11 pr-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-5">
        <button className="rounded-xl p-2 sm:p-3 hover:bg-slate-100 text-slate-600" aria-label="Toggle theme">
          <Moon size={20} />
        </button>

        <button className="rounded-xl p-2 sm:p-3 hover:bg-slate-100 text-slate-600" aria-label="Notifications">
          <Bell size={20} />
        </button>

        <Link href="/dashboard/profile" className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100 transition">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={displayName}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm sm:text-base shrink-0">
              {initial}
            </div>
          )}

          <div className="hidden sm:block">
            <p className="font-semibold text-slate-900 leading-tight text-sm">
              {displayName}
            </p>
            <p className="text-xs text-slate-500">
              Student
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}