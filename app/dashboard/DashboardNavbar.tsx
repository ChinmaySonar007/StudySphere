"use client";

import { Bell, Moon, Search } from "lucide-react";

export default function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

      <div className="relative w-96">

        <Search
          className="absolute left-4 top-3.5 text-slate-400"
          size={18}
        />

        <input
          placeholder="Search..."
          className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 outline-none"
        />

      </div>

      <div className="flex items-center gap-5">

        <button className="rounded-xl p-3 hover:bg-slate-100">
          <Moon />
        </button>

        <button className="rounded-xl p-3 hover:bg-slate-100">
          <Bell />
        </button>

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
            C
          </div>

          <div>

            <p className="font-semibold">
              Chinmay
            </p>

            <p className="text-sm text-slate-500">
              Student
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}