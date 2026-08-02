import {
  BookOpen,
  Brain,
  FileText,
  MessageSquare,
} from "lucide-react";

const stats = [
  {
    title: "Documents",
    value: "12",
    icon: FileText,
  },
  {
    title: "Chats",
    value: "31",
    icon: MessageSquare,
  },
  {
    title: "Flashcards",
    value: "820",
    icon: Brain,
  },
  {
    title: "Notes",
    value: "18",
    icon: BookOpen,
  },
];

import FileUploadBox from "@/components/upload/FileUploadBox";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold">
        Welcome Back 👋
      </h1>

      <p className="mt-2 text-slate-500">
        Continue your AI learning journey.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Icon className="mb-5 text-indigo-600" />

              <h2 className="text-3xl font-bold">
                {item.value}
              </h2>

              <p className="mt-2 text-slate-500">
                {item.title}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <FileUploadBox />
      </div>
    </div>
  );
}