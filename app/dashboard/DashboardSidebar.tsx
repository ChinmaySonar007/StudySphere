"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  NotebookPen,
  Brain,
  ClipboardCheck,
  Network,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/auth";

const menu = [

  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    title: "AI Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Notes",
    href: "/dashboard/notes",
    icon: NotebookPen,
  },
  {
    title: "Flashcards",
    href: "/dashboard/flashcards",
    icon: Brain,
  },
  {
    title: "Quiz",
    href: "/dashboard/quizzes",
    icon: ClipboardCheck,
  },
  {
    title: "Mind Maps",
    href: "/dashboard/mindmaps",
    icon: Network,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-slate-200 bg-white">
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold">
          StudySphere
        </h1>

        <p className="text-sm text-slate-500">
          AI Study OS
        </p>
      </div>

      <nav className="space-y-2 p-5">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl p-3 transition ${
                pathname === item.href
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={20} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-8 w-72 px-5">
        <Link
          href="/dashboard/profile"
          className="mb-2 flex items-center gap-3 rounded-xl p-3 hover:bg-slate-100"
        >
          <User size={20} />
          Profile
        </Link>

        <Link
          href="/dashboard/settings"
          className="mb-2 flex items-center gap-3 rounded-xl p-3 hover:bg-slate-100"
        >
          <Settings size={20} />
          Settings
        </Link>

        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl p-3 text-red-500 hover:bg-red-50"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}