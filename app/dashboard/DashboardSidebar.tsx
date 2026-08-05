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
  X,
  GraduationCap,
} from "lucide-react";
import { logout } from "@/lib/auth";

const menu = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Documents", href: "/dashboard/documents", icon: FileText },
  { title: "AI Chat", href: "/dashboard/chat", icon: MessageSquare },
  { title: "Notes", href: "/dashboard/notes", icon: NotebookPen },
  { title: "Flashcards", href: "/dashboard/flashcards", icon: Brain },
  { title: "Quiz", href: "/dashboard/quizzes", icon: ClipboardCheck },
  { title: "Mind Maps", href: "/dashboard/mindmaps", icon: Network },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div className="flex h-full w-72 flex-col bg-white border-r border-slate-200">
      <div className="flex items-center justify-between border-b p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">StudySphere</h1>
            <p className="text-xs text-slate-500">AI Study OS</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={20} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-1 bg-slate-50/50">
        <Link
          href="/dashboard/profile"
          onClick={handleLinkClick}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 transition"
        >
          <User size={20} />
          Profile
        </Link>

        <Link
          href="/dashboard/settings"
          onClick={handleLinkClick}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 transition"
        >
          <Settings size={20} />
          Settings
        </Link>

        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-red-600 font-medium hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-10 flex h-full max-w-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}